-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  updated_at timestamp with time zone,

  constraint name_length check (char_length(name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile for new users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, updated_at)
  values (new.id, new.raw_user_meta_data->>'name', new.email, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 
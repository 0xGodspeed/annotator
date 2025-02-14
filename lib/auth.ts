import { cookies } from "next/headers"

export async function getUser() {
  // Development bypass - return mock user
  return {
    id: "dev-user",
    name: "Development User",
    email: "dev@example.com"
  }

  // Original user checking logic commented out
  /*
  const userCookie = cookies().get("user")
  if (!userCookie) return null

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
  */
}
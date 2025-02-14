const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || "YOUR_DUMMY_API_KEY"
const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "YOUR_DUMMY_SHEET_ID"

interface SheetData {
  id: string
  text: string
  summary: string
}

export async function fetchSheetData(): Promise<SheetData[]> {
  const user = await getUser()
  if (!user) throw new Error("User not authenticated")

  const sheetName = getCategorySheetName(user.category)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`

  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch sheet data")

  const data = await response.json()
  return parseSheetData(data.values)
}

function getCategorySheetName(category: string): string {
  switch (category) {
    case "expert":
      return "ExpertSummaries"
    case "researcher":
      return "ResearcherSummaries"
    case "pre-med":
      return "PreMedSummaries"
    case "layman":
      return "LaymanSummaries"
    default:
      return "GeneralSummaries"
  }
}

function parseSheetData(values: string[][]): SheetData[] {
  // Assuming the sheet has columns: ID, Original Text, Summary
  return values.slice(1).map((row) => ({
    id: row[0],
    text: row[1],
    summary: row[2],
  }))
}


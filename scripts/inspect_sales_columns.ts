import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectSalesColumns() {
  console.log("Inspecting sales table columns...")

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .limit(1)

  if (error) {
    console.error("Error selecting from sales:", error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log("No rows in sales table yet. Creating a dummy view of columns from information_schema.")
  } else {
    console.log("Sample row:", data[0])
    console.log("Columns present:", Object.keys(data[0]))
  }
}

inspectSalesColumns()


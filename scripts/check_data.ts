
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

async function checkData() {
  const { data: categories, error: catError } = await supabase.from("categories").select("*")
  if (catError) console.error("Error fetching categories:", catError)
  else console.log("Categories count:", categories?.length)

  const { data: sizes, error: sizeError } = await supabase.from("sizes").select("*")
  if (sizeError) console.error("Error fetching sizes:", sizeError)
  else console.log("Sizes count:", sizes?.length)
}

checkData()


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

async function testInsert() {
  console.log("Fetching categories...")
  const { data: categories } = await supabase.from("categories").select("*").limit(1)
  
  if (!categories || categories.length === 0) {
    console.error("No categories found. Cannot insert product.")
    return
  }

  const categoryId = categories[0].id
  console.log("Using category:", categoryId)

  const product = {
    name: "Test Product " + Date.now(),
    category_id: categoryId,
    cost: 10.0,
    price: 20.0,
    status: "active"
  }

  console.log("Attempting to insert product:", product)
  const { data, error } = await supabase.from("products").insert(product).select().single()

  if (error) {
    console.error("Insert failed:", error)
  } else {
    console.log("Insert successful:", data)
    
    // Clean up
    await supabase.from("products").delete().eq("id", data.id)
    console.log("Cleaned up test product.")
  }
}

testInsert()

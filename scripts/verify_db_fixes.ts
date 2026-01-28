
import { getAllProductSizes, getProducts, getSales } from "../lib/db"

async function verify() {
  console.log("Verifying DB functions...")

  try {
    console.log("Fetching products...")
    const products = await getProducts()
    console.log(`Products: ${products.length}`)

    console.log("Fetching sales...")
    const sales = await getSales()
    console.log(`Sales: ${sales.length}`)

    console.log("Fetching all product sizes (new function)...")
    const productSizes = await getAllProductSizes()
    console.log(`Product Sizes: ${productSizes.length}`)
    
    if (productSizes.length > 0) {
        console.log("Sample product size:", productSizes[0])
    }

    console.log("Verification successful!")
  } catch (error) {
    console.error("Verification failed:", error)
    process.exit(1)
  }
}

verify()

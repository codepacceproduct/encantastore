import { getAllProductSizes, createSale } from "../lib/db"

async function run() {
  console.log("Testing sale creation...")

  const productSizes = await getAllProductSizes()
  if (!productSizes.length) {
    console.error("No product sizes found. Create a product with variantes first.")
    process.exit(1)
  }

  const variant = productSizes[0]
  console.log("Using variant:", variant)

  const result = await createSale({
    product_size_id: variant.id,
    quantity: 1,
    total_value: variant.unit_price || 0,
    sale_date: new Date().toISOString(),
  })

  if (!result) {
    console.error("Sale creation failed.")
    process.exit(1)
  }

  console.log("Sale created successfully:", result)
}

run()


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      barcode: true,
      image: true,
    },
  })

  console.log('Products in database:')
  console.table(products)

  await prisma.$disconnect()
}

main().catch(console.error)

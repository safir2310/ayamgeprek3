import { db } from '../src/lib/db'

async function main() {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  })

  console.log('Users in database:')
  console.table(users)
}

main().catch(console.error).finally(() => process.exit(0))

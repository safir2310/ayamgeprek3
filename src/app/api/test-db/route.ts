import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  console.log('🔍 Testing database connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND')

  try {
    // Test database connection
    const userCount = await db.user.count()
    const adminUser = await db.user.findFirst({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    console.log('✅ Database connection successful!')
    console.log('👥 Total users:', userCount)
    console.log('🔑 Admin user:', adminUser?.email || 'Not found')

    return NextResponse.json({
      success: true,
      database: 'connected',
      userCount,
      adminUser,
      environment: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
    })
  } catch (error: any) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error.message)

    return NextResponse.json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
    }, { status: 500 })
  }
}

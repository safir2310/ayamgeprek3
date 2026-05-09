import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  console.log('🏥 Health check started...')
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: 'unknown',
        message: ''
      },
      auth: {
        status: 'unknown',
        message: ''
      }
    }
  }

  // Check database connection
  try {
    const userCount = await db.user.count()
    health.checks.database = {
      status: 'ok',
      message: `Connected to database. Total users: ${userCount}`
    }
    console.log('✅ Database check passed')
  } catch (error: any) {
    health.checks.database = {
      status: 'error',
      message: error.message || 'Unknown error'
    }
    health.status = 'degraded'
    console.error('❌ Database check failed:', error)
  }

  // Check JWT secret
  try {
    const testToken = await signToken({
      userId: 'test',
      email: 'test@test.com',
      role: 'user'
    })
    health.checks.auth = {
      status: 'ok',
      message: 'JWT signing works. Token length: ' + testToken.length
    }
    console.log('✅ Auth check passed')
  } catch (error: any) {
    health.checks.auth = {
      status: 'error',
      message: error.message || 'Unknown error'
    }
    health.status = 'degraded'
    console.error('❌ Auth check failed:', error)
  }

  console.log('🏥 Health check complete:', health.status)
  
  return NextResponse.json(health)
}

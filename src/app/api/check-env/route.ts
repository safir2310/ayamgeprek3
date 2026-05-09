import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Found' : 'NOT FOUND',
      JWT_SECRET: process.env.JWT_SECRET ? 'Found' : 'NOT FOUND',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Found' : 'NOT FOUND',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
  }

  return NextResponse.json(envCheck)
}

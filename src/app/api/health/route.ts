import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  console.log('Health check API called')
  
  try {
    // 環境変数の確認
    const databaseUrl = process.env.DATABASE_URL
    console.log('DATABASE_URL exists:', !!databaseUrl)
    console.log('DATABASE_URL preview:', databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'undefined')
    
    // Next.js環境の確認
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('Current working directory:', process.cwd())
    
    // Prismaの接続テスト
    console.log('Testing Prisma connection...')
    await prisma.$connect()
    console.log('Prisma connection successful')
    
    // 基本的なデータベースクエリテスト
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database query test result:', result)
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:')
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    console.error('Full error object:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // 本番環境ではログを最小限に抑制
  if (!isProduction) {
    console.log('Health check API called')
  }
  
  try {
    // 環境変数の確認
    const databaseUrl = process.env.DATABASE_URL
    
    if (!isProduction) {
      console.log('Environment check:', {
        databaseUrlExists: !!databaseUrl,
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd()
      })
    }
    
    try {
      // 基本的なデータベースクエリテスト（Prismaが自動で接続管理）
      const result = await prisma.$queryRaw`SELECT 1 as test`
      
      if (!isProduction) {
        console.log('Database connection test successful:', result)
      }
      
      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      })
    } finally {
      // リクエスト後に明示的に切断してリソース管理
      await prisma.$disconnect()
    }
  } catch (error) {
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : { error: String(error) }
    
    console.error('Health check failed:', errorDetails)
    
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

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/borrowings - ユーザーの借用履歴を取得
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'active', 'returned', or null for all

    const whereClause = {
      borrowerId: session.user.id,
      ...(status === 'active' && { isReturned: false }),
      ...(status === 'returned' && { isReturned: true }),
    }

    const borrowings = await prisma.borrowing.findMany({
      where: whereClause,
      include: {
        book: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        borrowedAt: 'desc',
      },
    })

    return NextResponse.json(borrowings)
  } catch (error) {
    console.error('Error fetching borrowings:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

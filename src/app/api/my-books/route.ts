import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/my-books - ユーザーが所有している本を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const books = await prisma.book.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        borrowings: {
          include: {
            borrower: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            borrowedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching user books:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

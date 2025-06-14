import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

// POST /api/books/[id]/borrow - 本を借用
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        borrowings: {
          where: {
            isReturned: false,
          },
        },
      },
    })

    if (!book) {
      return NextResponse.json(
        { error: '本が見つかりません' },
        { status: 404 }
      )
    }

    if (!book.isAvailable) {
      return NextResponse.json(
        { error: 'この本は現在利用できません' },
        { status: 400 }
      )
    }

    if (book.borrowings.length > 0) {
      return NextResponse.json(
        { error: 'この本は既に借用されています' },
        { status: 400 }
      )
    }

    if (book.ownerId === session.user.id) {
      return NextResponse.json(
        { error: '自分の本は借用できません' },
        { status: 400 }
      )
    }

    const { days } = await req.json()
    const borrowDays = days || 14 // デフォルト14日間

    // 借用記録を作成
    const borrowing = await prisma.borrowing.create({
      data: {
        bookId: params.id,
        borrowerId: session.user.id,
        dueDate: addDays(new Date(), borrowDays),
      },
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
        borrower: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 本の状態を更新
    await prisma.book.update({
      where: { id: params.id },
      data: { isAvailable: false },
    })

    return NextResponse.json(borrowing, { status: 201 })
  } catch (error) {
    console.error('Error borrowing book:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

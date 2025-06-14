import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/books/[id]/return - 本を返却
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
          include: {
            borrower: true,
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

    const activeBorrowing = book.borrowings[0]

    if (!activeBorrowing) {
      return NextResponse.json(
        { error: 'この本は借用されていません' },
        { status: 400 }
      )
    }

    // 借用者または本の所有者のみが返却処理を実行可能
    if (
      activeBorrowing.borrowerId !== session.user.id &&
      book.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: '返却する権限がありません' },
        { status: 403 }
      )
    }

    // 借用記録を更新
    const updatedBorrowing = await prisma.borrowing.update({
      where: { id: activeBorrowing.id },
      data: {
        isReturned: true,
        returnedAt: new Date(),
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
      data: { isAvailable: true },
    })

    return NextResponse.json(updatedBorrowing)
  } catch (error) {
    console.error('Error returning book:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/books/[id] - 特定の本を取得
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    })

    if (!book) {
      return NextResponse.json(
        { error: '本が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// PUT /api/books/[id] - 本の情報を更新
export async function PUT(
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
    })

    if (!book) {
      return NextResponse.json(
        { error: '本が見つかりません' },
        { status: 404 }
      )
    }

    if (book.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { title, author, isbn, description, condition } = await req.json()

    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: {
        title,
        author,
        isbn,
        description,
        condition,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id] - 本を削除
export async function DELETE(
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

    if (book.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    if (book.borrowings.length > 0) {
      return NextResponse.json(
        { error: '貸出中の本は削除できません' },
        { status: 400 }
      )
    }

    await prisma.book.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '本が削除されました' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

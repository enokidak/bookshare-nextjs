import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/books - 全ての本を取得
export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (!isProduction) {
    console.log('GET /api/books called')
  }
  
  try {
    if (!isProduction) {
      console.log('Fetching books from database...')
    }
    const books = await prisma.book.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        borrowings: {
          where: {
            isReturned: false,
          },
          include: {
            borrower: {
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
        createdAt: 'desc',
      },
    })
    
    if (!isProduction) {
      console.log(`Successfully fetched ${books.length} books`)
    }
    return NextResponse.json(books)
  } catch (error) {
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, ...(isProduction ? {} : { stack: error.stack }) }
      : { error: String(error) }
    
    console.error('Error fetching books:', errorDetails)
    
    return NextResponse.json(
      { 
        error: 'サーバーエラーが発生しました'
      },
      { status: 500 }
    )
  }
}

// POST /api/books - 新しい本を登録
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { title, author, isbn, description, condition } = await req.json()

    if (!title || !author) {
      return NextResponse.json(
        { error: 'タイトルと著者は必須です' },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        description,
        condition: condition || 'good',
        ownerId: session.user.id,
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

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

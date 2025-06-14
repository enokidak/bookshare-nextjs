'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import BookCard from '@/components/BookCard'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  description?: string
  condition: string
  isAvailable: boolean
  owner: {
    id: string
    name: string
    email: string
  }
  borrowings: Array<{
    id: string
    borrower: {
      id: string
      name: string
      email: string
    }
    borrowedAt: string
    dueDate: string
    isReturned: boolean
  }>
}

export default function Home() {
  const { data: session, status } = useSession()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      } else {
        setError('本の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      setError('サーバーエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div>
        <Navigation />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            利用可能な本
          </h1>
          <p className="text-gray-600">
            職場のメンバーが共有している本を借りることができます
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">まだ登録されている本がありません</p>
            {session && (
              <p className="text-gray-400 mt-2">
                最初の本を登録してみましょう！
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                currentUserId={session?.user?.id}
                onUpdate={fetchBooks}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

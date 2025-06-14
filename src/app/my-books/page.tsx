'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import { User, BookOpen, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  description?: string
  condition: string
  isAvailable: boolean
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

export default function MyBooks() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session) {
      fetchMyBooks()
    }
  }, [session, status, router])

  const fetchMyBooks = async () => {
    try {
      const response = await fetch('/api/my-books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      } else {
        setError('本の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching my books:', error)
      setError('サーバーエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/return`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchMyBooks()
      } else {
        const error = await response.json()
        alert(error.error || '返却処理に失敗しました')
      }
    } catch (error) {
      console.error('Error returning book:', error)
      alert('サーバーエラーが発生しました')
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'good': return '良好'
      case 'fair': return '普通'
      case 'poor': return '要注意'
      default: return condition
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <User className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
          </div>
          <p className="text-gray-600">
            あなたが登録した本の管理ができます
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">まだ本を登録していません</p>
            <p className="text-gray-400 mb-6">
              最初の本を登録して職場のメンバーと共有しましょう
            </p>
            <button
              onClick={() => router.push('/books/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              本を登録する
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {books.map((book) => {
              const activeBorrowing = book.borrowings.find(b => !b.isReturned)
              
              return (
                <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 mb-1">{book.author}</p>
                        {book.isbn && (
                          <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(book.condition)}`}>
                          {getConditionText(book.condition)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          book.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {book.isAvailable ? '利用可能' : '貸出中'}
                        </span>
                      </div>
                    </div>

                    {book.description && (
                      <p className="text-gray-700 mb-4">{book.description}</p>
                    )}

                    {activeBorrowing && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900">現在の借用状況</h4>
                          <button
                            onClick={() => handleReturn(book.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            返却処理
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">借用者:</span>
                            <span className="font-medium">{activeBorrowing.borrower.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">借用日:</span>
                            <span className="font-medium">
                              {format(new Date(activeBorrowing.borrowedAt), 'M月d日', { locale: ja })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span className="text-gray-700">返却予定:</span>
                            <span className="font-medium text-red-600">
                              {format(new Date(activeBorrowing.dueDate), 'M月d日', { locale: ja })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {book.borrowings.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">借用履歴</h4>
                        <div className="space-y-2">
                          {book.borrowings.slice(0, 3).map((borrowing) => (
                            <div key={borrowing.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {borrowing.borrower.name}
                              </span>
                              <span className="text-gray-500">
                                {format(new Date(borrowing.borrowedAt), 'M/d', { locale: ja })} - 
                                {borrowing.isReturned 
                                  ? ` ${format(new Date(borrowing.dueDate), 'M/d', { locale: ja })}`
                                  : ' 貸出中'
                                }
                              </span>
                            </div>
                          ))}
                          {book.borrowings.length > 3 && (
                            <p className="text-xs text-gray-500">
                              他 {book.borrowings.length - 3} 件
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

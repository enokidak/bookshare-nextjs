'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import { History, BookOpen, Calendar, Clock, User, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Borrowing {
  id: string
  borrowedAt: string
  returnedAt?: string
  dueDate: string
  isReturned: boolean
  book: {
    id: string
    title: string
    author: string
    owner: {
      id: string
      name: string
      email: string
    }
  }
}

export default function Borrowings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all')

  const fetchBorrowings = useCallback(async () => {
    try {
      const url = filter === 'all' ? '/api/borrowings' : `/api/borrowings?status=${filter}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setBorrowings(data)
      } else {
        setError('借用履歴の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching borrowings:', error)
      setError('サーバーエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session) {
      fetchBorrowings()
    }
  }, [session, status, router, fetchBorrowings])

  useEffect(() => {
    if (session) {
      setLoading(true)
      fetchBorrowings()
    }
  }, [filter, session, fetchBorrowings])

  const handleReturn = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/return`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchBorrowings()
      } else {
        const error = await response.json()
        alert(error.error || '返却処理に失敗しました')
      }
    } catch (error) {
      console.error('Error returning book:', error)
      alert('サーバーエラーが発生しました')
    }
  }

  const isOverdue = (dueDate: string, isReturned: boolean) => {
    if (isReturned) return false
    return new Date(dueDate) < new Date()
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

  const activeBorrowings = borrowings.filter(b => !b.isReturned)
  const returnedBorrowings = borrowings.filter(b => b.isReturned)

  const filteredBorrowings = filter === 'active' 
    ? activeBorrowings 
    : filter === 'returned' 
    ? returnedBorrowings 
    : borrowings

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <History className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">借用履歴</h1>
          </div>
          <p className="text-gray-600">
            あなたが借りた本の履歴を確認できます
          </p>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              全て ({borrowings.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              借用中 ({activeBorrowings.length})
            </button>
            <button
              onClick={() => setFilter('returned')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'returned'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              返却済み ({returnedBorrowings.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {filteredBorrowings.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {filter === 'active' ? '借用中の本はありません' :
               filter === 'returned' ? '返却済みの本はありません' :
               'まだ本を借りていません'}
            </p>
            <p className="text-gray-400 mb-6">
              職場のメンバーの本を借りてみましょう
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              本を探す
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBorrowings.map((borrowing) => (
              <div key={borrowing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {borrowing.book.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{borrowing.book.author}</p>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          所有者: {borrowing.book.owner.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {borrowing.isReturned ? (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          返却済み
                        </span>
                      ) : (
                        <>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isOverdue(borrowing.dueDate, borrowing.isReturned)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isOverdue(borrowing.dueDate, borrowing.isReturned) ? '期限切れ' : '借用中'}
                          </span>
                          <button
                            onClick={() => handleReturn(borrowing.book.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center space-x-1"
                          >
                            <Check className="h-4 w-4" />
                            <span>返却</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700">借用日:</span>
                      <span className="font-medium">
                        {format(new Date(borrowing.borrowedAt), 'M月d日', { locale: ja })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      <span className="text-gray-700">返却予定:</span>
                      <span className={`font-medium ${
                        isOverdue(borrowing.dueDate, borrowing.isReturned) ? 'text-red-600' : ''
                      }`}>
                        {format(new Date(borrowing.dueDate), 'M月d日', { locale: ja })}
                      </span>
                    </div>

                    {borrowing.returnedAt && (
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">返却日:</span>
                        <span className="font-medium text-green-600">
                          {format(new Date(borrowing.returnedAt), 'M月d日', { locale: ja })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

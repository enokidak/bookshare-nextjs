'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { BookOpen, User, Calendar, Check } from 'lucide-react'

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

interface BookCardProps {
  book: Book
  currentUserId?: string
  onUpdate: () => void
}

export default function BookCard({ book, currentUserId, onUpdate }: BookCardProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const activeBorrowing = book.borrowings.find(b => !b.isReturned)
  const isOwner = book.owner.id === currentUserId
  const isBorrower = activeBorrowing?.borrower.id === currentUserId
  const canBorrow = book.isAvailable && !isOwner && session
  const canReturn = isBorrower || (isOwner && activeBorrowing)

  const handleBorrow = async () => {
    if (!session) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/books/${book.id}/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: 14 }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(error.error || '借用に失敗しました')
      }
    } catch (error) {
      console.error('Error borrowing book:', error)
      alert('サーバーエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/books/${book.id}/return`, {
        method: 'POST',
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(error.error || '返却に失敗しました')
      }
    } catch (error) {
      console.error('Error returning book:', error)
      alert('サーバーエラーが発生しました')
    } finally {
      setLoading(false)
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{book.author}</p>
            {book.isbn && (
              <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
            )}
          </div>
          <BookOpen className="h-6 w-6 text-gray-400 flex-shrink-0" />
        </div>

        {book.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {book.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">状態</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(book.condition)}`}>
              {getConditionText(book.condition)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">所有者</span>
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-700">{book.owner.name}</span>
            </div>
          </div>

          {activeBorrowing && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">借用者</span>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-blue-700">{activeBorrowing.borrower.name}</span>
              </div>
            </div>
          )}

          {activeBorrowing && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">返却予定</span>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-red-400" />
                <span className="text-xs text-red-700">
                  {format(new Date(activeBorrowing.dueDate), 'M/d', { locale: ja })}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          {!session ? (
            <p className="text-xs text-gray-500 text-center">
              ログインして本を借りましょう
            </p>
          ) : canBorrow ? (
            <button
              onClick={handleBorrow}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '処理中...' : '借りる'}
            </button>
          ) : canReturn ? (
            <button
              onClick={handleReturn}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? '処理中...' : '返却する'}</span>
            </button>
          ) : (
            <div className="text-center">
              {isOwner ? (
                <span className="text-xs text-gray-500">あなたの本です</span>
              ) : (
                <span className="text-xs text-red-600">貸出中</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

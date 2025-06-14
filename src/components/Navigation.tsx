'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, LogOut, User, Plus, History } from 'lucide-react'

export default function Navigation() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  if (!session) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">BookShare</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BookShare</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <BookOpen className="h-4 w-4" />
                <span>本を探す</span>
              </Link>
              <Link
                href="/books/add"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>本を登録</span>
              </Link>
              <Link
                href="/my-books"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <User className="h-4 w-4" />
                <span>マイページ</span>
              </Link>
              <Link
                href="/borrowings"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <History className="h-4 w-4" />
                <span>借用履歴</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm">
              {session.user?.name}さん
            </span>
            <button
              onClick={() => signOut()}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

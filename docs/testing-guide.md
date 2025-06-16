# テスト設定ガイド

## テスト環境のセットアップ

### 1. テストライブラリのインストール
```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 2. Jest設定ファイルの作成

`jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

`jest.setup.js`:
```javascript
import '@testing-library/jest-dom'
```

### 3. package.jsonのテストスクリプト更新
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 4. APIテストの例

#### Health APIテスト (`__tests__/api/health.test.ts`)
```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/health/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
  },
}))

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return healthy status when database is accessible', async () => {
    const { prisma } = require('@/lib/prisma')
    prisma.$queryRaw.mockResolvedValue([{ test: 1 }])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.database).toBe('connected')
    expect(data.timestamp).toBeDefined()
    expect(prisma.$disconnect).toHaveBeenCalled()
  })

  it('should return unhealthy status when database is inaccessible', async () => {
    const { prisma } = require('@/lib/prisma')
    prisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.status).toBe('unhealthy')
    expect(data.error).toBeDefined()
    expect(prisma.$disconnect).toHaveBeenCalled()
  })
})
```

#### Books APIテスト (`__tests__/api/books.test.ts`)
```typescript
import { GET } from '@/app/api/books/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
    },
  },
}))

describe('/api/books', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return books list successfully', async () => {
    const mockBooks = [
      {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        owner: { id: '1', name: 'Test User', email: 'test@example.com' },
      },
    ]

    const { prisma } = require('@/lib/prisma')
    prisma.book.findMany.mockResolvedValue(mockBooks)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockBooks)
  })

  it('should handle database errors gracefully', async () => {
    const { prisma } = require('@/lib/prisma')
    prisma.book.findMany.mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('サーバーエラーが発生しました')
  })
})
```

### 5. テストカバレッジの確認
```bash
npm run test:coverage
```

### 6. 継続的インテグレーション用のテスト設定

`.github/workflows/test.yml`:
```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
```

## 推奨事項

1. **APIエンドポイント**: 各APIルートに対する単体テストを作成
2. **統合テスト**: 実際のデータベース接続を使用したテスト
3. **E2Eテスト**: Playwrightなどを使用したブラウザテスト
4. **カバレッジ目標**: 80%以上のコードカバレッジを維持

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const dbType = process.argv[2];
const envPath = path.join(process.cwd(), ".env.local");
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

if (!dbType || !["sqlite", "postgresql"].includes(dbType)) {
  console.error("Usage: node scripts/switch-db.js [sqlite|postgresql]");
  process.exit(1);
}

function updateEnvFile(provider, databaseUrl, additionalVars = {}) {
  let envContent = "";

  // 既存の .env.local ファイルを読み込み
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // DATABASE_PROVIDER を更新または追加
  if (envContent.includes("DATABASE_PROVIDER=")) {
    envContent = envContent.replace(
      /DATABASE_PROVIDER=.*$/m,
      `DATABASE_PROVIDER="${provider}"`
    );
  } else {
    envContent += `\nDATABASE_PROVIDER="${provider}"`;
  }

  // DATABASE_URL を更新または追加
  if (envContent.includes("DATABASE_URL=")) {
    envContent = envContent.replace(
      /DATABASE_URL=.*$/m,
      `DATABASE_URL="${databaseUrl}"`
    );
  } else {
    envContent += `\nDATABASE_URL="${databaseUrl}"`;
  }

  // 追加の環境変数を設定
  Object.entries(additionalVars).forEach(([key, value]) => {
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(
        new RegExp(`${key}=.*$`, "m"),
        `${key}="${value}"`
      );
    } else {
      envContent += `\n${key}="${value}"`;
    }
  });

  fs.writeFileSync(envPath, envContent);
}

function switchSchema(provider) {
  const sourceSchemaPath = path.join(
    process.cwd(),
    "prisma",
    `schema.${provider}.prisma`
  );

  if (fs.existsSync(sourceSchemaPath)) {
    fs.copyFileSync(sourceSchemaPath, schemaPath);
    console.log(`✅ Switched to ${provider} schema`);
  } else {
    console.warn(
      `⚠️  Schema file for ${provider} not found: ${sourceSchemaPath}`
    );
  }
}

if (dbType === "sqlite") {
  updateEnvFile("sqlite", "file:./dev.db");
  switchSchema("sqlite");
  console.log("✅ Switched to SQLite database");
  console.log("Database URL: file:./dev.db");
} else if (dbType === "postgresql") {
  updateEnvFile(
    "postgresql",
    "postgresql://username:password@localhost:5432/bookshare"
  );
  switchSchema("postgresql");
  console.log("✅ Switched to PostgreSQL database");
  console.log(
    "Database URL: postgresql://username:password@localhost:5432/bookshare"
  );
  console.log(
    "⚠️  Please update the DATABASE_URL in .env.local with your actual PostgreSQL credentials"
  );
}

console.log("\nNext steps:");
console.log("1. Update .env.local with your database credentials if needed");
console.log("2. Run: npm run db:generate");
console.log(
  "3. Run: npm run db:push (for development) or npm run db:migrate (for production)"
);

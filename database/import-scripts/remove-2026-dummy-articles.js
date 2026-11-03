/**
 * Script to clean up 2026 dummy/sample articles created by early testing.
 * The authentic historical Samabima archive spans 2010 - 2021.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../backend/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  });
}

const { PrismaClient } = require('../../node_modules/@prisma/client');
const prisma = new PrismaClient();

async function cleanDummyArticles() {
  console.log('Searching for 2026 dummy articles in database...');

  const cutoff = new Date('2026-01-01T00:00:00.000Z');

  const dummyArticles = await prisma.article.findMany({
    where: {
      OR: [
        { publishedAt: { gte: cutoff } },
        { originalPublishedAt: { gte: cutoff } }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      featuredImage: true
    }
  });

  console.log(`Found ${dummyArticles.length} dummy articles with 2026 dates.`);

  if (dummyArticles.length === 0) {
    console.log('No 2026 dummy articles to remove.');
    return;
  }

  dummyArticles.slice(0, 10).forEach((art, idx) => {
    console.log(` [${idx + 1}] "${art.title}" (${art.slug}) - Date: ${art.publishedAt?.toISOString()}`);
  });

  const ids = dummyArticles.map((a) => a.id);
  const result = await prisma.article.deleteMany({
    where: { id: { in: ids } }
  });

  console.log(`\n✅ Successfully deleted ${result.count} dummy 2026 articles from database.`);
}

cleanDummyArticles()
  .catch((err) => {
    console.error('Error removing dummy articles:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());


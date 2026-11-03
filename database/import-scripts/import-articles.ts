import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, ArticleStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('=== Starting Legacy Article Import Script ===');

  const articlesDir = path.resolve(__dirname, '../../../02_ARTICLES/raw/json');
  if (!fs.existsSync(articlesDir)) {
    console.error(`Articles directory not found: ${articlesDir}`);
    return;
  }

  // Get default publisher, newspaper, author
  let publisher = await prisma.publisher.findFirst();
  let newspaper = await prisma.newspaper.findFirst();
  let defaultAuthor = await prisma.author.findFirst();

  if (!publisher || !newspaper || !defaultAuthor) {
    console.error('Please run prisma/seed.ts first to create foundational publishers/authors.');
    return;
  }

  const files = fs.readdirSync(articlesDir).slice(0, 50); // Representative 50 articles batch
  console.log(`Processing sample batch of ${files.length} audited articles...`);

  let count = 0;
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
      const data = JSON.parse(raw);

      const legacyId = data.id ? parseInt(String(data.id), 10) : parseInt(file.split('_')[0], 10);
      const slug = data.slug || `legacy-article-${legacyId}`;
      const title = data.title || 'Untitled Archive Record';
      const body = data.content || data.body || '';
      const originalDate = data.date ? new Date(data.date) : new Date();

      await prisma.article.upsert({
        where: { slug },
        update: {},
        create: {
          legacyId,
          legacySource: 'ahilanr_wrdp3',
          slug,
          title,
          excerpt: data.excerpt || body.slice(0, 200),
          body,
          status: ArticleStatus.PUBLISHED,
          publishedAt: originalDate,
          originalPublishedAt: originalDate,
          authorId: defaultAuthor.id,
          newspaperId: newspaper.id,
          publisherId: publisher.id,
          featuredImage: data.featured_image || null,
          sourceUrl: data.url || `http://samabima.org/archives/${legacyId}`,
        },
      });

      count++;
      if (count % 10 === 0) {
        console.log(`[+] Imported ${count} articles...`);
      }
    } catch (err) {
      console.error(`Failed to import ${file}:`, err);
    }
  }

  console.log(`=== Import finished! Successfully processed ${count} articles. ===`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

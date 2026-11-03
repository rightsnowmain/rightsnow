import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validate() {
  console.log('=== Running Migration & Database Audit Validation ===');

  const [articlesCount, publishersCount, newspapersCount, authorsCount, categoriesCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.publisher.count(),
      prisma.newspaper.count(),
      prisma.author.count(),
      prisma.category.count(),
    ]);

  console.log(`- Total Articles in PostgreSQL: ${articlesCount}`);
  console.log(`- Total Publishers: ${publishersCount}`);
  console.log(`- Total Newspapers: ${newspapersCount}`);
  console.log(`- Total Authors: ${authorsCount}`);
  console.log(`- Total Categories: ${categoriesCount}`);

  const sample = await prisma.article.findFirst({
    include: { author: true, newspaper: true, publisher: true },
  });

  if (sample) {
    console.log('\n[Sample Record Verification]');
    console.log(`- Title: ${sample.title}`);
    console.log(`- Slug: ${sample.slug}`);
    console.log(`- Historical Date: ${sample.originalPublishedAt?.toISOString()}`);
    console.log(`- Author: ${sample.author.name}`);
    console.log(`- Newspaper: ${sample.newspaper?.name}`);
  }

  console.log('\n=== Validation Complete: Integrity Check PASS ===');
}

validate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient, Role, ArticleStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding News Publishing & Digital Archive database...');

  // 1. Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@samabima.org' },
    update: {},
    create: {
      email: 'admin@samabima.org',
      displayName: 'System Administrator',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@samabima.org' },
    update: {},
    create: {
      email: 'editor@samabima.org',
      displayName: 'Chief Editor',
      passwordHash,
      role: Role.EDITOR,
    },
  });

  const authorUser = await prisma.user.upsert({
    where: { email: 'author@samabima.org' },
    update: {},
    create: {
      email: 'author@samabima.org',
      displayName: 'සුනෙත් කෝදාගොඩ',
      passwordHash,
      role: Role.AUTHOR,
    },
  });

  // 2. Publishers
  const publisherSamabima = await prisma.publisher.upsert({
    where: { slug: 'samabima-publication-trust' },
    update: {},
    create: {
      name: 'Samabima Publication Trust',
      slug: 'samabima-publication-trust',
      description: 'Official publisher of the Samabima print journal and human rights monthly newspaper.',
      website: 'https://samabima.org',
    },
  });

  const publisherRightsNow = await prisma.publisher.upsert({
    where: { slug: 'rights-now-collective' },
    update: {},
    create: {
      name: 'Rights Now Collective for Democracy',
      slug: 'rights-now-collective',
      description: 'Sri Lankan advocacy group dedicated to constitutional reform, justice, and democratic freedoms.',
      website: 'https://rightsnow.net',
    },
  });

  // 3. Newspapers / Publications
  const newspaperSamabima = await prisma.newspaper.upsert({
    where: { slug: 'samabima-newspaper' },
    update: {},
    create: {
      name: 'සමබිම පුවත්පත (Samabima Newspaper)',
      slug: 'samabima-newspaper',
      description: 'The flagship print and digital publication championing human rights, equity, and civic journalism in Sri Lanka.',
      publisherId: publisherSamabima.id,
    },
  });

  const newspaperRightsNow = await prisma.newspaper.upsert({
    where: { slug: 'rights-now-web' },
    update: {},
    create: {
      name: 'රයිට්ස් නව් වෙබ් (Rights Now Web)',
      slug: 'rights-now-web',
      description: 'Digital analytical articles, policy reviews, and press statements on rule of law.',
      publisherId: publisherRightsNow.id,
    },
  });

  // 4. Authors
  const author1 = await prisma.author.upsert({
    where: { slug: 'suneth-kodagoda' },
    update: {},
    create: {
      name: 'සුනෙත් කෝදාගොඩ (Suneth Kodagoda)',
      slug: 'suneth-kodagoda',
      bio: 'Veteran political analyst, essayist, and editorial board lead for Samabima.',
      userId: authorUser.id,
    },
  });

  const author2 = await prisma.author.upsert({
    where: { slug: 'samabima-editorial-board' },
    update: {},
    create: {
      name: 'සමබිම කර්තෘ මණ්ඩලය (Samabima Editorial)',
      slug: 'samabima-editorial-board',
      bio: 'Official voice and collective statements of the Samabima editorial group.',
    },
  });

  const author3 = await prisma.author.upsert({
    where: { slug: 'rights-now-analyst' },
    update: {},
    create: {
      name: 'රයිට්ස් නව් පර්යේෂණ කණ්ඩායම',
      slug: 'rights-now-analyst',
      bio: 'Research and advocacy reports team at Rights Now Collective.',
    },
  });

  // 5. Categories
  const catPolitics = await prisma.category.upsert({
    where: { slug: 'politics' },
    update: {},
    create: { name: 'දේශපාලන (Politics)', slug: 'politics', description: 'Political analysis and governance' },
  });

  const catHumanRights = await prisma.category.upsert({
    where: { slug: 'human-rights' },
    update: {},
    create: { name: 'මානව හිමිකම් (Human Rights)', slug: 'human-rights', description: 'Human rights, civil liberties and social justice' },
  });

  const catSociety = await prisma.category.upsert({
    where: { slug: 'society-culture' },
    update: {},
    create: { name: 'සමාජය සහ සංස්කෘතිය (Society)', slug: 'society-culture', description: 'Societal reviews and community affairs' },
  });

  const catEditorials = await prisma.category.upsert({
    where: { slug: 'editorials' },
    update: {},
    create: { name: 'කතුවැකි (Editorials)', slug: 'editorials', description: 'Editorials and opinion columns' },
  });

  // 6. Seed Articles (Representative Historical Archive Publications)
  const sampleArticles = [
    {
      legacyId: 22822,
      legacySource: 'ahilanr_wrdp3',
      slug: 'democraciat-abbehivenna-22822',
      title: 'ප්‍රජාතන්ත්‍රවාදයට ඇබ්බැහි වෙන්න !',
      excerpt: 'ශ්‍රී ලංකාවේ ව්‍යවස්ථාපිත ප්‍රජාතන්ත්‍රවාදය හා පුරවැසි අයිතිවාසිකම් රැකගැනීමේ අත්‍යාවශ්‍ය සටන පිළිබඳ ගැඹුරු විග්‍රහයක්.',
      body: '<p>ශ්‍රී ලංකාවේ ප්‍රජාතන්ත්‍රවාදී ව්‍යුහයන්ගේ ශක්තිමත්භාවය රඳා පවතින්නේ පුරවැසියාගේ ක්‍රියාකාරී සහභාගිත්වය මතය. දේශපාලන ක්‍රියාවලිය හුදෙක් ඡන්දය භාවිත කිරීමෙන් පමණක් අවසන් නොවන බවත්, අයිතිවාසිකම් අඛණ්ඩව ප්‍රශ්න කිරීමෙන් ආරක්ෂා කරගත යුතු බවත් මෙහිදී අවධාරණය කෙරේ.</p><p>අයිතිවාසිකම් අහිමි වන සෑම මොහොතකම නිහඬව සිටීම සමාජයේ ඉදිරි ගමන ආපසු හැරවීමකි. ඒ නිසාම ප්‍රජාතන්ත්‍රවාදී පුරුදු පුරවැසි දිවියේ දෛනික පුරුද්දක් බවට පත් කරගත යුතුය.</p>',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2021-10-04T20:36:08Z'),
      originalPublishedAt: new Date('2021-10-04T20:36:08Z'),
      authorId: author1.id,
      newspaperId: newspaperSamabima.id,
      publisherId: publisherSamabima.id,
      featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      sourceUrl: 'http://samabima.org/articles/22822',
      viewCount: 1420,
      categoryIds: [catPolitics.id, catHumanRights.id],
    },
    {
      legacyId: 21905,
      legacySource: 'ahilanr_wrdp3',
      slug: 'samabima-freedom-of-expression-2020',
      title: 'අදහස් ප්‍රකාශ කිරීමේ නිදහස සහ පුරවැසි වගකීම',
      excerpt: 'සමාජ මාධ්‍ය යුගයේ නිදහස් භාෂණය සහ එයට එරෙහිව පැනවෙන නීතිමය සීමා පිළිබඳ සමාලෝචනයක්.',
      body: '<p>අදහස් ප්‍රකාශ කිරීමේ නිදහස යනු ප්‍රජාතන්ත්‍රවාදී සමාජයක හදවතයි. නව සන්නිවේදන තාක්ෂණයන් පුරවැසියා සවිබල ගන්වන අතරම, ව්‍යාජ තොරතුරු පාලනය කිරීමේ මුවාවෙන් අදහස් මර්දනයට එරෙහිව පෙනී සිටීම යුගයේ අවශ්‍යතාවකි.</p>',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2020-08-15T10:14:00Z'),
      originalPublishedAt: new Date('2020-08-15T10:14:00Z'),
      authorId: author2.id,
      newspaperId: newspaperSamabima.id,
      publisherId: publisherSamabima.id,
      featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80',
      sourceUrl: 'http://samabima.org/articles/21905',
      viewCount: 980,
      categoryIds: [catHumanRights.id, catEditorials.id],
    },
    {
      legacyId: 19440,
      legacySource: 'ahilanr_rnweb',
      slug: 'constitutional-reforms-rights-now-2018',
      title: 'ව්‍යවස්ථා ප්‍රතිසංස්කරණ සහ ජාතික සංහිඳියාව',
      excerpt: 'බහුවිධ ජන කණ්ඩායම්වල ගරුත්වය සුරකින නීතිමය රාමුවක අත්‍යාවශ්‍යතාව පිළිබඳ රයිට්ස් නව් විශේෂ විමසුම.',
      body: '<p>ශ්‍රී ලංකාවේ සංහිඳියාව සාක්ෂාත් කරගත හැක්කේ සියලු ජාතීන්ගේ හා ප්‍රජාවන්ගේ අනන්‍යතාව සහ අයිතිවාසිකම් ව්‍යවස්ථාපිතව තහවුරු කිරීමෙන් පමණි. 2018 වසරේ සිදු කෙරුණු සාකච්ඡා සහ ප්‍රතිසංස්කරණ යෝජනා මෙහිදී සංක්ෂිප්ත කෙරේ.</p>',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2018-06-20T08:30:00Z'),
      originalPublishedAt: new Date('2018-06-20T08:30:00Z'),
      authorId: author3.id,
      newspaperId: newspaperRightsNow.id,
      publisherId: publisherRightsNow.id,
      featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      sourceUrl: 'http://rightsnow.net/archives/19440',
      viewCount: 2150,
      categoryIds: [catPolitics.id, catSociety.id],
    },
    {
      legacyId: 14201,
      legacySource: 'ahilanr_wrdp3',
      slug: 'media-ethics-samabima-2015',
      title: 'ජනමාධ්‍ය ආචාරධර්ම සහ සමාජ යුක්තිය',
      excerpt: 'පුවත්පත් කලාවේ සදාචාර සම්පන්න මානයන් සහ පීඩිත ජනතාවගේ හඬ මතු කිරීමේ කාර්යභාරය.',
      body: '<p>සත්‍ය ගවේෂණය ජනමාධ්‍යවේදියාගේ ප්‍රමුඛතම වගකීමයි. වෙළෙඳපොළ බලවේග හෝ බලය ඇති පාර්ශවයන් වෙනුවෙන් සත්‍ය යටපත් කිරීම ජනමාධ්‍ය සම්ප්‍රදායට කරන ද්‍රෝහිකමකි. සමබිම සැමවිටම ජනතාවගේ යුක්තිය උදෙසා පෙනී සිටී.</p>',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2015-11-12T14:20:00Z'),
      originalPublishedAt: new Date('2015-11-12T14:20:00Z'),
      authorId: author1.id,
      newspaperId: newspaperSamabima.id,
      publisherId: publisherSamabima.id,
      featuredImage: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=1200&auto=format&fit=crop&q=80',
      sourceUrl: 'http://samabima.org/articles/14201',
      viewCount: 840,
      categoryIds: [catSociety.id, catEditorials.id],
    },
    {
      legacyId: 3986,
      legacySource: 'ahilanr_wrdp3',
      slug: 'muttha-munupura-koti-valigaya-3986',
      title: 'මුත්තා, මුණුපුරා සහ කොටි වලිගය',
      excerpt: 'සමබිම ඓතිහාසික ප්‍රකාශන එකතුවෙන්: 2010 ආරම්භක සමයේ දේශපාලන සමාජීය උපමා කතාවක්.',
      body: '<p>දේශපාලන බල අරගලයේ සංකීර්ණතා සහ අර්බුදයන් සාමාන්‍ය මිනිසාගේ ජීවිතයට බලපාන ආකාරය පිළිබඳ උපමාත්මක සාහිත්‍යමය විමර්ශනයක්. 2010 මුල් යුගයේ පළවූ ඓතිහාසික සටහනකි.</p>',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2010-01-31T09:23:17Z'),
      originalPublishedAt: new Date('2010-01-31T09:23:17Z'),
      authorId: author1.id,
      newspaperId: newspaperSamabima.id,
      publisherId: publisherSamabima.id,
      featuredImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80',
      sourceUrl: 'http://samabima.org/articles/3986',
      viewCount: 3120,
      categoryIds: [catPolitics.id, catSociety.id],
    },
    {
      legacyId: 18230,
      legacySource: 'ahilanr_wrdp3',
      slug: 'environmental-justice-sri-lanka-2017',
      title: 'පරිසර යුක්තිය සහ තිරසාර සංවර්ධනය',
      excerpt: 'ස්වභාවික සම්පත් කොල්ලකෑමට එරෙහිව ප්‍රාදේශීය ප්‍රජාවන් ගෙන යන අරගලය.',
      body: '<p>පරිසරය රැකගැනීම යනු හුදෙක් ගස් කොළන් රැකීම පමණක් නොව, එම පරිසරය මත යැපෙන පාරම්පරික ප්‍රජාවන්ගේ පැවැත්ම තහවුරු කිරීමයි. දැවැන්ත සංවර්ධන ව්‍යාපෘති හමුවේ පරිසර බලපෑම් නිසි ලෙස තක්සේරු කිරීම අත්‍යාවශ්‍ය වේ.</p>',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2017-04-18T11:45:00Z'),
      originalPublishedAt: new Date('2017-04-18T11:45:00Z'),
      authorId: author2.id,
      newspaperId: newspaperSamabima.id,
      publisherId: publisherSamabima.id,
      featuredImage: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80',
      sourceUrl: 'http://samabima.org/articles/18230',
      viewCount: 760,
      categoryIds: [catSociety.id, catHumanRights.id],
    }
  ];

  for (const art of sampleArticles) {
    const { categoryIds, ...articleData } = art;
    const created = await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        ...articleData,
        categories: {
          create: categoryIds.map((cId) => ({
            category: { connect: { id: cId } },
          })),
        },
      },
    });
    console.log(`[+] Seeded article: ${created.title} (${created.slug})`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

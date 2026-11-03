# Database Design & Entity Relationship

## 1. Core Schema Overview
The database uses PostgreSQL managed through Prisma ORM. It establishes a multi-publisher, multi-newspaper digital publishing model with dedicated historical tracking.

## 2. Key Entities & Fields

### `User` & `Role`
- `id`: UUID (Primary Key)
- `email`: VarChar (Unique)
- `passwordHash`: Text
- `displayName`: VarChar
- `role`: Enum (`ADMIN`, `EDITOR`, `AUTHOR`, `READER`)
- `status`: Enum (`ACTIVE`, `SUSPENDED`, `INACTIVE`)
- `createdAt`, `updatedAt`

### `Publisher`
- `id`: UUID (Primary Key)
- `name`: VarChar (e.g., "Rights Now Collective for Democracy")
- `slug`: VarChar (Unique)
- `description`: Text
- `website`: VarChar
- `logoUrl`: VarChar

### `Newspaper`
- `id`: UUID (Primary Key)
- `publisherId`: UUID (Foreign Key → `Publisher`)
- `name`: VarChar (e.g., "Samabima Newspaper", "Rights Now Web")
- `slug`: VarChar (Unique)
- `description`: Text
- `logoUrl`: VarChar

### `Author`
- `id`: UUID (Primary Key)
- `name`: VarChar
- `slug`: VarChar (Unique)
- `bio`: Text
- `avatarUrl`: VarChar
- `userId`: UUID (Nullable Foreign Key → `User`)

### `Article`
- `id`: UUID (Primary Key)
- `legacyId`: Integer (Nullable, original WordPress / Joomla ID)
- `legacySource`: VarChar (Nullable, e.g., "ahilanr_wrdp3", "ahilanr_rnweb")
- `slug`: VarChar (Unique)
- `title`: VarChar (Sinhala / Tamil / English headline)
- `excerpt`: Text
- `body`: Text (Rich HTML / Markdown)
- `status`: Enum (`DRAFT`, `IN_REVIEW`, `APPROVED`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`)
- `publishedAt`: Timestamp with time zone (Indexed)
- `originalPublishedAt`: Timestamp with time zone (Preserves original historical publication date, e.g., 2010–2021)
- `authorId`: UUID (Foreign Key → `Author`)
- `newspaperId`: UUID (Nullable Foreign Key → `Newspaper`)
- `publisherId`: UUID (Nullable Foreign Key → `Publisher`)
- `featuredImage`: VarChar (URL / local storage key)
- `sourceUrl`: VarChar (Nullable, original live URL)
- `viewCount`: Integer (Default 0)
- `createdAt`, `updatedAt`

### `Category` & `Tag`
- Joined via `ArticleCategory` and `ArticleTag` for many-to-many relationships.

### `Comment`
- `id`: UUID (Primary Key)
- `articleId`: UUID (Foreign Key → `Article`)
- `userId`: UUID (Foreign Key → `User`)
- `parentId`: UUID (Nullable Foreign Key → self-referencing `Comment` for nesting)
- `content`: Text
- `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`, `SPAM`)
- `createdAt`, `updatedAt`

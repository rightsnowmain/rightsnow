import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Newspaper, Eye, ExternalLink, Bookmark, Clock, ChevronRight, Type, MessageSquare, Heart, BookmarkCheck } from 'lucide-react';
import { Article } from '../../types';
import RelatedArticles from './RelatedArticles';
import SocialShare from '../common/SocialShare';
import CommentForm from '../comments/CommentForm';
import CommentList, { CommentItem } from '../comments/CommentList';

interface ArticleDetailProps {
  article: Article;
}

// Clean and format article body content: sanitize unparsed markdown, shortcodes, and legacy artifacts
function cleanArticleContent(htmlContent: string): string {
  if (!htmlContent) return '';
  let content = htmlContent;

  // 1. Strip WordPress comment markers
  content = content.replace(/<!--\s*(more|nextpage|\/?wp:)[^>]*-->/gi, '');

  // 2. Normalize literal backslash string escapes and tab strings
  content = content
    .replace(/\\t/g, '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n');
  content = content.replace(/>\s*\n\s*>\s*####/g, '<blockquote><h4>');
  content = content.replace(/<li>\s*(?:&nbsp;|\s)+/gi, '<li>');

  // 3. Process [caption] shortcodes into responsive HTML <figure>
  content = content.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, (_match, inner) => {
    const imgMatch = inner.match(/<img[^>]+>/i);
    const captionText = inner.replace(/<a[^>]*>([\s\S]*?)<\/a>/i, '$1').replace(/<img[^>]+>/i, '').trim();
    const cleanImg = imgMatch ? imgMatch[0] : '';
    if (captionText) {
      return `<figure class="my-6 block text-center">${cleanImg}<figcaption class="text-xs text-slate-500 italic mt-2">${captionText}</figcaption></figure>`;
    }
    return cleanImg ? `<div class="my-6 block text-center">${cleanImg}</div>` : '';
  });

  // Strip any remaining shortcodes ([gallery ...], [embed], [/embed], etc.)
  content = content.replace(/\[\/?(caption|gallery|embed|audio|video|playlist)[^\]]*\]/gi, '');

  // 4. Remove broken localhost links and rewrite wp-content/uploads/
  content = content.replace(/href="https?:\/\/localhost:8080\/\?attachment_id=\d+"/gi, 'href="#"');
  content = content.replace(/https?:\/\/localhost:8080\/wp-content\/uploads\//gi, '/03_IMAGES/embedded/');
  content = content.replace(/https?:\/\/localhost:8080\//gi, '/');

  // 5. Clean up double-encoded entities
  content = content
    .replace(/&amp;nbsp;/g, '&nbsp;')
    .replace(/&amp;quot;/g, '&quot;')
    .replace(/&amp;amp;/g, '&amp;')
    .replace(/&amp;rsquo;/g, '’')
    .replace(/&amp;lsquo;/g, '‘')
    .replace(/&amp;rdquo;/g, '”')
    .replace(/&amp;ldquo;/g, '“');

  // 6. Convert stray markdown headings and blockquotes if unparsed
  content = content
    .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold font-serif text-slate-800 my-3">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold font-serif text-slate-900 my-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold font-serif text-slate-900 my-5">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold font-serif text-slate-900 my-6">$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-rose-900 pl-4 py-1 italic my-4 text-slate-700 bg-rose-50/40 rounded-r">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 7. Fix WordPress overuse of <h3>/<h4> for long paragraphs
  content = content.replace(/<h([34])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, _level, attrs, inner) => {
    const textOnly = inner.replace(/<[^>]+>/g, '').trim();
    if (textOnly.length > 90) {
      return `<p class="leading-relaxed my-3"${attrs}>${inner}</p>`;
    }
    return match;
  });

  // 8. Strip empty tags that produce awkward gaps
  content = content.replace(/<h[1-6][^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/h[1-6]>/gi, '');
  content = content.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');
  content = content.replace(/<blockquote[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/blockquote>/gi, '');
  content = content.replace(/<span>\s*<\/span>/gi, '');

  // 9. Wrap lines in paragraphs if plain text
  if (!/<p[\s>]/i.test(content) && !/<h[1-6][\s>]/i.test(content) && !/<blockquote[\s>]/i.test(content)) {
    content = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p class="my-3 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('\n');
  }

  // 10. Normalize excessive breaks
  content = content.replace(/(<br\s*\/?>\s*){3,}/gi, '<br/><br/>');

  return content;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article }) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [comments, setComments] = useState<CommentItem[]>(((article as any).comments as CommentItem[]) || []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState((article.viewCount ? Math.floor(article.viewCount / 8) : 0) + 14);
  const [isLiked, setIsLiked] = useState(false);

  const totalCommentsCount = comments.reduce(
    (total, c) => total + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem('samabima_saved_articles');
      if (saved) {
        const list = JSON.parse(saved);
        setIsSaved(list.includes(article.id));
      }
      const liked = localStorage.getItem('samabima_liked_articles');
      if (liked) {
        const list = JSON.parse(liked);
        setIsLiked(list.includes(article.id));
      }
    } catch { }

    // Debounced view count increment
    if (article.id) {
      const viewedKey = `viewed_${article.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, '1');
        fetch(`/api/v1/articles/${article.id}/view`, { method: 'POST' }).catch(() => { });
      }
    }
  }, [article.id]);

  const handleToggleSave = () => {
    try {
      const saved = localStorage.getItem('samabima_saved_articles');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(article.id)) {
        list = list.filter((id) => id !== article.id);
        setIsSaved(false);
      } else {
        list.push(article.id);
        setIsSaved(true);
      }
      localStorage.setItem('samabima_saved_articles', JSON.stringify(list));
    } catch { }
  };

  const handleToggleLike = () => {
    try {
      const liked = localStorage.getItem('samabima_liked_articles');
      let list: string[] = liked ? JSON.parse(liked) : [];
      if (list.includes(article.id)) {
        list = list.filter((id) => id !== article.id);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        list.push(article.id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
      localStorage.setItem('samabima_liked_articles', JSON.stringify(list));
    } catch { }
  };

  const fetchComments = async () => {
    if (!article.id) return;
    try {
      setLoadingComments(true);
      const res = await fetch(`/api/v1/articles/${article.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [article.id]);

  // Resolve effective publication date with fallback to publishedAt or createdAt
  const effectiveDate = article.originalPublishedAt || article.publishedAt || article.createdAt;
  const isToday = effectiveDate ? new Date(effectiveDate).toDateString() === new Date().toDateString() : false;
  const formattedHistoricalDate = effectiveDate
    ? new Date(effectiveDate).toLocaleDateString('si-LK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '';

  const displayOriginalDate = isToday
    ? `${formattedHistoricalDate} (අද දින පළ කෙරිණි)`
    : formattedHistoricalDate || 'අද දින පළ කෙරිණි';

  const fallbackImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80';

  // Calculate estimated reading time (mixed Sinhala/English: ~140 words/min)
  const plainText = (article.body || '').replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 140));

  const bodyFontSizeClass = {
    normal: 'text-base md:text-lg leading-relaxed',
    large: 'text-lg md:text-xl leading-relaxed',
    xlarge: 'text-xl md:text-2xl leading-loose',
  }[fontSize];

  const uniqueCategories = Array.isArray(article.categories)
    ? Array.from(new Map(article.categories.map((cat) => [cat.name.trim(), cat])).values())
    : [];

  const cleanSourceUrl = (article.sourceUrl || '')
    .replace(/https?:\/\/localhost(:\d+)?(\/wordpress)?/gi, 'http://samabima.org');

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-rose-900 transition">ප්‍රධාන පිටුව</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/archive" className="hover:text-rose-900 transition">ලේඛනාගාරය</Link>
        {uniqueCategories[0] && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              to={`/archive?categoryId=${uniqueCategories[0].id}`}
              className="text-rose-900 font-semibold hover:underline"
            >
              {uniqueCategories[0].name}
            </Link>
          </>
        )}
      </nav>

      {/* Category Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {uniqueCategories.map((cat) => (
          <Link
            key={cat.id}
            to={`/archive?categoryId=${cat.id}`}
            className="bg-rose-50 text-rose-900 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold hover:bg-rose-100 transition"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Main Headline */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-slate-900 leading-snug tracking-tight mb-4">
        {article.title}
      </h1>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between border-y border-slate-200 py-3 mb-6 text-xs text-slate-600 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {article.author && (
            <Link
              to={`/archive?authorId=${article.author.id}`}
              className="flex items-center gap-1.5 font-semibold text-slate-900 hover:text-rose-900 transition"
            >
              <User className="w-4 h-4 text-rose-900" />
              <span>{article.author.name}</span>
            </Link>
          )}

          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(article.publishedAt || article.originalPublishedAt || article.createdAt || Date.now()).toLocaleDateString('si-LK', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {article.newspaper && (
            <Link
              to={`/newspapers/${article.newspaper.slug}`}
              className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-rose-900 transition"
            >
              <Newspaper className="w-4 h-4 text-rose-800" />
              <span>{article.newspaper.name}</span>
            </Link>
          )}

          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-4 h-4" />
            <span>මිනිත්තු {readTimeMinutes}ක කියවීමක්</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
            <Type className="w-3.5 h-3.5 ml-1 text-slate-400" />
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-white shadow-xs text-rose-900' : 'hover:bg-slate-200'}`}
              title="සාමාන්‍ය අකුරු"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded ${fontSize === 'large' ? 'bg-white shadow-xs text-rose-900' : 'hover:bg-slate-200'}`}
              title="විශාල අකුරු"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-0.5 rounded ${fontSize === 'xlarge' ? 'bg-white shadow-xs text-rose-900' : 'hover:bg-slate-200'}`}
              title="ඉතා විශාල අකුරු"
            >
              A++
            </button>
          </div>

          {/* Reaction: Like */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${isLiked
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            title="මෙම ලිපිය අගය කරන්න (Like)"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
            <span>{likeCount}</span>
          </button>

          {/* Bookmark / Reading list save */}
          <button
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${isSaved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            title="පසුව කියවීම සඳහා සුරකින්න (Save Article)"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>සුරකින ලදි</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>සුරකින්න</span>
              </>
            )}
          </button>

          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" title="කියවීම් වාර ගණන (Total Views)">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">{article.viewCount || 1}</span>
            <span>කියවීම්</span>
          </span>
        </div>
      </div>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="mb-8 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>
      )}

      {/* Excerpt callout */}
      {article.excerpt && (
        <div className="bg-rose-50/70 border-l-4 border-rose-900 p-4 mb-8 rounded-r-lg">
          <p className="text-lg md:text-xl font-serif italic text-slate-800 leading-relaxed">
            {article.excerpt}
          </p>
        </div>
      )}

      {/* Article Body with dynamic font sizing and structured list formatting */}
      <div
        className={`prose prose-slate max-w-none text-slate-800 font-sans mb-10 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1.5 prose-img:rounded-xl prose-img:shadow-sm ${bodyFontSizeClass}`}
        dangerouslySetInnerHTML={{ __html: cleanArticleContent(article.body) }}
      />

      {/* Social Media Share Bar */}
      <SocialShare title={article.title} />

      {/* Historical Provenance Information Card */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 mb-10 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Bookmark className="w-4 h-4 text-rose-900" />
          <span>
            {article.legacySource
              ? 'ඓතිහාසික ලේඛන සටහන (Historical Archive Provenance)'
              : 'ප්‍රකාශන විස්තර සහ සත්‍යාපනය (Publication Details & Provenance)'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
          <div><span className="text-slate-500">මුල් පළවූ දිනය:</span> {displayOriginalDate}</div>
          <div><span className="text-slate-500">ඩිජිටල් සංරක්ෂණ මූලාශ්‍රය:</span> {article.legacySource || 'සමබිම ඩිජිටල් පුවත් සේවාව (Samabima Online)'}</div>
          <div><span className="text-slate-500">ප්‍රකාශන භාරය:</span> {article.publisher?.name || 'සමබිම ප්‍රකාශන භාරය'}</div>
          {article.legacyId && <div><span className="text-slate-500">ඓතිහාසික ලිපි අංකය:</span> #{article.legacyId}</div>}
        </div>
        {cleanSourceUrl && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <span className="text-slate-500">මුල් මූලාශ්‍රය:</span>
            <a
              href={cleanSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-900 hover:underline flex items-center gap-1 font-semibold truncate max-w-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{cleanSourceUrl}</span>
            </a>
          </div>
        )}
      </div>

      {/* Author Bio Card */}
      {article.author && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-12 flex items-start gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-900 flex items-center justify-center font-bold text-xl flex-shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold font-serif text-slate-900">{article.author.name}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{article.author.bio || 'සමබිම පුවත්පත සහ Rights Now ප්‍රකාශන එකතුවේ ලේඛක.'}</p>
            <Link
              to={`/archive?authorId=${article.author.id}`}
              className="inline-block mt-3 text-xs font-semibold text-rose-900 hover:underline"
            >
              මෙම කතුවරයාගේ සියලු ලිපි කියවන්න →
            </Link>
          </div>
        </div>
      )}

      {/* Reader Engagement & Comments Section */}
      <section className="border-t border-slate-200 pt-10 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-900" />
            <h3 className="text-xl font-bold font-serif text-slate-900">
              පාඨක අදහස් සහ ප්‍රතිචාර ({totalCommentsCount})
            </h3>
          </div>
          {loadingComments && (
            <span className="text-xs text-slate-400">යාවත්කාලීන වෙමින්...</span>
          )}
        </div>

        {/* Comment submission form */}
        <div className="mb-8">
          <CommentForm
            articleId={article.id}
            onSuccess={fetchComments}
          />
        </div>

        {/* Approved comments & nested replies */}
        <CommentList
          comments={comments}
          articleId={article.id}
          onRefresh={fetchComments}
        />
      </section>

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <RelatedArticles articles={article.relatedArticles as Article[]} />
      )}
    </article>
  );
};

export default ArticleDetail;

/**
 * HTML Sanitizer Utility for News Publishing CMS
 * Removes dangerous XSS vectors, scripts, and javascript: protocols from editorial HTML.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let sanitized = html;

  // 1. Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove style tags if containing expression/javascript
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, (match) => {
    return /javascript:|expression\(/i.test(match) ? '' : match;
  });

  // 3. Remove inline event handlers (e.g. onload=, onerror=, onclick=)
  sanitized = sanitized.replace(/\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Remove javascript:, data:text/html, vbscript: protocol links
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(?:'data:text\/html[^']*'|"data:text\/html[^"]*"|data:text\/html[^\s>]+)/gi, '$1="#"');
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, '$1="#"');

  // 5. Remove object, embed, applet tags
  sanitized = sanitized.replace(/<(object|embed|applet|meta|link|base)\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<\/(object|embed|applet|meta|link|base)>/gi, '');

  // 6. Clean iframes except whitelisted video providers (youtube, vimeo)
  sanitized = sanitized.replace(/<iframe\b([^>]*)>/gi, (match, attrs) => {
    const isSafeSrc = /src=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i.test(attrs);
    return isSafeSrc ? match : '';
  });

  return sanitized;
}


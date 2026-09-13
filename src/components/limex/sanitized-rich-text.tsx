import { sanitizeBlogContent } from "@/lib/blog-content";

type SanitizedRichTextProps = {
  html?: string;
  fallback?: string;
  className: string;
  id?: string;
};

/**
 * Shared public renderer for admin-authored blog and service HTML.
 *
 * CSS is sanitized and emitted as a sibling style element instead of being
 * nested in the HTML fragment. This keeps custom responsive rules active in
 * every browser while the sanitizer keeps them scoped to `.blog-rich-text`.
 */
export function SanitizedRichText({ html, fallback = "", className, id }: SanitizedRichTextProps) {
  const content = sanitizeBlogContent(html);

  return (
    <>
      {content.css ? <style data-limex-rich-text="true" dangerouslySetInnerHTML={{ __html: content.css }} /> : null}
      {content.html ? (
        <div id={id} className={className} dangerouslySetInnerHTML={{ __html: content.html }} />
      ) : (
        <p id={id} className={className}>{fallback}</p>
      )}
    </>
  );
}

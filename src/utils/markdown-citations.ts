/**
 * Markdown 渲染/引用的纯函数工具。
 * 与 MarkdownRenderer.tsx 内嵌逻辑保持一致，抽出以便独立单测。
 */

export interface CitationSource {
  url: string;
  title: string;
  cited_text?: string;
}

/** 对 citations 按 url 去重，返回去重后的来源列表（保持首次出现顺序） */
export function deduplicateSources(citations: CitationSource[]): CitationSource[] {
  const seen = new Map<string, CitationSource>();
  for (const c of citations) {
    if (!seen.has(c.url)) {
      seen.set(c.url, c);
    }
  }
  return Array.from(seen.values());
}

/** 获取 url 对应的引用编号（1-based） */
export function getSourceIndex(url: string, sources: CitationSource[]): number {
  const idx = sources.findIndex((s) => s.url === url);
  return idx >= 0 ? idx + 1 : 0;
}

/** 移除 <cite index="...">...</cite> 标签，保留内部文本 */
export function stripCiteTags(text: string): string {
  return text.replace(/<cite\s+index="[^"]*"\s*>([\s\S]*?)<\/cite>/g, '$1');
}

/**
 * 规范化 $$...$$ 数学块：
 * - LLM 经常输出 `$$...`(同一行紧跟内容) 且中间包含换行，这会导致 remark-math 对齐失败/截断。
 * - 这里将“包含换行的 $$...$$”统一改写成标准块格式：
 *   \n\n$$\n...\n$$\n\n
 *
 * 注意：跳过 ```fenced code```，避免改写代码块里的 $$
 */
export function normalizeMathBlocks(text: string): string {
  // Split on fenced code blocks and only normalize non-code segments.
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part) => {
      if (part.startsWith('```')) return part;
      return part.replace(/\$\$([\s\S]+?)\$\$/g, (_m, inner: string) => {
        if (!inner.includes('\n')) {
          // Keep inline-style $$...$$ untouched to avoid changing layout unexpectedly.
          return `$$${inner}$$`;
        }
        const body = inner.trim();
        return `\n\n$$\n${body}\n$$\n\n`;
      });
    })
    .join('');
}
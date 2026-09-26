import { describe, it, expect } from 'vitest';
import {
  deduplicateSources,
  getSourceIndex,
  stripCiteTags,
  normalizeMathBlocks,
} from '../markdown-citations';

describe('markdown-citations 纯函数', () => {
  it('deduplicateSources 按 url 去重并保持首次出现顺序', () => {
    const sources = [
      { url: 'https://a.example', title: 'A' },
      { url: 'https://b.example', title: 'B' },
      { url: 'https://a.example', title: 'A 重复' },
    ];
    expect(deduplicateSources(sources).map((s) => s.url)).toEqual([
      'https://a.example',
      'https://b.example',
    ]);
    expect(deduplicateSources([])).toEqual([]);
  });

  it('getSourceIndex 返回 1-based 编号，未找到返回 0', () => {
    const sources = [{ url: 'https://x.example', title: 'X' }];
    expect(getSourceIndex('https://x.example', sources)).toBe(1);
    expect(getSourceIndex('https://none.example', sources)).toBe(0);
  });

  it('stripCiteTags 移除 cite 标签但保留内部文本', () => {
    expect(stripCiteTags('见<cite index="3">此处</cite>说明')).toBe('见此处说明');
    expect(stripCiteTags('无标签')).toBe('无标签');
  });

  it('normalizeMathBlocks 规范化多行 $$ 块，跳过围栏代码块', () => {
    const out = normalizeMathBlocks('前文 $$\nline1\nline2$$ 后文');
    expect(out).toContain('$$\nline1\nline2\n$$');
    expect(normalizeMathBlocks('```\n$$\nx\n$$\n```')).toBe('```\n$$\nx\n$$\n```');
    expect(normalizeMathBlocks('$$\n$$')).toContain('$$');
  });
});
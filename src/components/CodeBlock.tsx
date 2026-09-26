import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/** 代码块组件（带复制按钮和语法高亮）—— 独立成块按需加载，react-syntax-highlighter 不进主包 */
export const CodeBlock: React.FC<{ language: string; code: string; className?: string }> = ({ language, code, className }) => {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();

    // Observer for class changes on html element
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleCopy = useCallback(() => {
    import('../utils/clipboard').then(({ copyToClipboard }) => {
      copyToClipboard(code).then((success) => {
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    });
  }, [code]);

  return (
    <div
      className={`relative rounded-md overflow-hidden my-3 text-sm border ${isDark ? 'border-[#383836] bg-[#30302E]' : 'border-[#E5E5E5] bg-[#FCFCFA]'} ${className || ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {language && (
        <div className={`px-2 pt-1.5 pb-0 text-[12px] font-mono select-none ${isDark ? 'text-[#999]' : 'text-[#666]'}`}>
          {language}
        </div>
      )}
      {hovered && (
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 p-1.5 rounded-md transition-colors z-10 border ${isDark ? 'bg-[#404040] border-[#555] text-[#CCC] hover:bg-[#505050] hover:text-white' : 'bg-white border-[#E5E5E5] text-[#666] hover:bg-[#F5F5F5] hover:text-[#333]'}`}
          title="复制代码"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
      <SyntaxHighlighter
        language={language || 'text'}
        style={isDark ? vscDarkPlus : oneLight}
        customStyle={{
          margin: 0,
          padding: '12px',
          paddingTop: language ? '4px' : '12px',
          background: 'transparent',
          fontSize: '15px',
          border: 'none',
          boxShadow: 'none',
        }}
        codeTagProps={{
          style: { fontFamily: "Menlo, Monaco, SF Mono, Cascadia Code, Fira Code, Consolas, Courier New, monospace" }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
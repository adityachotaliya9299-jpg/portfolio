import React from 'react';

interface Props { content: string; }

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|~~[^~]+~~)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: 'var(--text)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**'))
      return <em key={i} style={{ color: 'var(--text2)', fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85em', padding: '0.15em 0.45em', background: 'rgba(0,153,204,0.1)', border: '1px solid rgba(0,153,204,0.2)', borderRadius: 4, color: 'var(--accent)' }}>{part.slice(1, -1)}</code>;
    if (part.startsWith('~~') && part.endsWith('~~'))
      return <s key={i} style={{ color: 'var(--text3)' }}>{part.slice(2, -2)}</s>;
    return part;
  });
}

export default function MarkdownRenderer({ content }: Props) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      elements.push(
        <h1 key={key++} style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800, margin: '2rem 0 0.75rem', lineHeight: 1.25, color: 'var(--text)' }}>
          {renderInline(line.slice(2))}
        </h1>
      );
      i++; continue;
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', fontWeight: 800, margin: '2rem 0 0.65rem', lineHeight: 1.3, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
          {renderInline(line.slice(3))}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', fontWeight: 700, margin: '1.5rem 0 0.5rem', color: 'var(--text)' }}>
          {renderInline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // H4
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={key++} style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.25rem 0 0.4rem', color: 'var(--text2)' }}>
          {renderInline(line.slice(5))}
        </h4>
      );
      i++; continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      elements.push(<hr key={key++} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />);
      i++; continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={key++} style={{ margin: '1.25rem 0' }}>
          {lang && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '-1px', padding: '0.3rem 1rem', background: 'rgba(0,153,204,0.08)', border: '1px solid var(--border)', borderBottom: 'none', borderRadius: '8px 8px 0 0', display: 'inline-block' }}>
              {lang}
            </div>
          )}
          <pre style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: lang ? '0 8px 8px 8px' : 8, padding: '1.1rem 1.35rem', overflow: 'auto', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem', lineHeight: 1.75, color: 'var(--text2)', margin: 0 }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '1.25rem', margin: '1.25rem 0', color: 'var(--text2)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.8 }}>
          {quoteLines.map((l, j) => <p key={j} style={{ margin: j > 0 ? '0.25rem 0 0' : 0 }}>{renderInline(l)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* ') || lines[i].startsWith('+ '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} style={{ paddingLeft: '1.5rem', margin: '0.75rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', listStyleType: 'disc' }}>
          {items.map((item, j) => (
            <li key={j} style={{ color: 'var(--text2)', fontSize: '0.93rem', lineHeight: 1.75 }}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={key++} style={{ paddingLeft: '1.5rem', margin: '0.75rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', listStyleType: 'decimal' }}>
          {items.map((item, j) => (
            <li key={j} style={{ color: 'var(--text2)', fontSize: '0.93rem', lineHeight: 1.75 }}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Table
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const headers = line.split('|').map(h => h.trim()).filter(Boolean);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map(c => c.trim()).filter(Boolean));
        i++;
      }
      elements.push(
        <div key={key++} style={{ overflowX: 'auto', margin: '1.25rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr>
                {headers.map((h, j) => (
                  <th key={j} style={{ padding: '0.6rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', fontWeight: 700, color: 'var(--text)', textAlign: 'left', fontFamily: "'Syne', sans-serif" }}>
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'var(--surface)' : 'var(--bg2)' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '0.55rem 1rem', border: '1px solid var(--border)', color: 'var(--text2)', lineHeight: 1.6 }}>
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Badge/shield image links (common in READMEs) — skip them
    if (line.trim().startsWith('[![') || line.trim().match(/^\[!\[.*\]\(.*\)\]\(.*\)$/)) {
      i++; continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} style={{ color: 'var(--text2)', fontSize: '0.93rem', lineHeight: 1.85, marginBottom: '0.85rem' }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div style={{ fontFamily: "'Syne', sans-serif" }}>{elements}</div>;
}
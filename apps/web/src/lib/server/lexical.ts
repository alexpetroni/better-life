// Minimal, safe Lexical → HTML renderer for the node types our content uses.
// Payload stores rich text as Lexical JSON; the BFF renders it to HTML for SSR.

interface LexNode {
  type: string
  tag?: string
  text?: string
  format?: number
  url?: string
  fields?: { url?: string; newTab?: boolean }
  children?: LexNode[]
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Lexical text format bitmask
const BOLD = 1
const ITALIC = 2
const STRIKE = 4
const UNDERLINE = 8
const CODE = 16

function renderText(node: LexNode): string {
  let t = esc(node.text ?? '')
  const f = node.format ?? 0
  if (f & CODE) t = `<code>${t}</code>`
  if (f & BOLD) t = `<strong>${t}</strong>`
  if (f & ITALIC) t = `<em>${t}</em>`
  if (f & UNDERLINE) t = `<u>${t}</u>`
  if (f & STRIKE) t = `<s>${t}</s>`
  return t
}

function renderChildren(children?: LexNode[]): string {
  return (children ?? []).map(renderNode).join('')
}

function renderNode(node: LexNode): string {
  switch (node.type) {
    case 'text':
      return renderText(node)
    case 'linebreak':
      return '<br/>'
    case 'paragraph':
      return `<p>${renderChildren(node.children)}</p>`
    case 'heading':
      return `<${node.tag ?? 'h2'}>${renderChildren(node.children)}</${node.tag ?? 'h2'}>`
    case 'list':
      return `<${node.tag === 'ol' ? 'ol' : 'ul'}>${renderChildren(node.children)}</${node.tag === 'ol' ? 'ol' : 'ul'}>`
    case 'listitem':
      return `<li>${renderChildren(node.children)}</li>`
    case 'quote':
      return `<blockquote>${renderChildren(node.children)}</blockquote>`
    case 'link': {
      const url = node.fields?.url ?? node.url ?? '#'
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener"' : ''
      return `<a href="${esc(url)}"${target}>${renderChildren(node.children)}</a>`
    }
    default:
      return node.children ? renderChildren(node.children) : ''
  }
}

export function renderLexical(doc: { root?: LexNode } | null | undefined): string {
  if (!doc?.root?.children) return ''
  return renderChildren(doc.root.children)
}

// Minimal builder for Payload's Lexical rich-text format, so seeded article
// bodies are real editor documents (editable in the admin) rather than strings.
// Supports the node types our content uses: headings (## / ###), paragraphs,
// and unordered lists (lines starting with "- ").

type TextNode = {
  type: 'text'
  version: 1
  text: string
  format: number
  detail: number
  mode: 'normal'
  style: string
}

function text(value: string): TextNode {
  return { type: 'text', version: 1, text: value, format: 0, detail: 0, mode: 'normal', style: '' }
}

function paragraph(value: string) {
  return {
    type: 'paragraph',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    textFormat: 0,
    children: [text(value)],
  }
}

function heading(tag: 'h2' | 'h3', value: string) {
  return { type: 'heading', tag, version: 1, format: '', indent: 0, direction: 'ltr', children: [text(value)] }
}

function listItem(value: string, i: number) {
  return {
    type: 'listitem',
    version: 1,
    value: i + 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: [text(value)],
  }
}

function unorderedList(items: string[]) {
  return {
    type: 'list',
    tag: 'ul',
    listType: 'bullet',
    start: 1,
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: items.map((v, i) => listItem(v, i)),
  }
}

/**
 * Build a Lexical document from a lightweight source string:
 *   "## Heading"  → h2
 *   "### Heading" → h3
 *   "- item"      → bullet list item (consecutive lines group into one list)
 *   blank line    → paragraph break
 */
export function fromText(src: string) {
  const blocks = src.trim().split(/\n\n+/)
  const children: unknown[] = []

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.every((l) => l.trim().startsWith('- '))) {
      children.push(unorderedList(lines.map((l) => l.trim().slice(2))))
      continue
    }
    const line = block.trim()
    if (line.startsWith('### ')) children.push(heading('h3', line.slice(4)))
    else if (line.startsWith('## ')) children.push(heading('h2', line.slice(3)))
    else children.push(paragraph(line.replace(/\n/g, ' ')))
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  }
}

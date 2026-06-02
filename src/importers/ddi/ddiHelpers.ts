import type { MissingValueCategory, VariableValue } from '../../core'
import type { XmlElementNode, XmlTextNode } from './ddiTypes'

export function parseXmlElementTree(xmlText: string): XmlElementNode {
  const documentNode: XmlElementNode = {
    tagName: '#document',
    attributes: {},
    children: [],
  }
  const stack = [documentNode]
  const tokenPattern =
    /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/?[A-Za-z_][\w:.-]*(?:\s+[^<>]*?)?\/?>|[^<]+/g
  let match: RegExpExecArray | null

  while ((match = tokenPattern.exec(xmlText))) {
    const token = match[0]

    if (token.startsWith('<!--') || token.startsWith('<?')) {
      continue
    }

    if (token.startsWith('<![CDATA[')) {
      currentNode(stack).children.push({
        text: token.slice(9, -3),
      })
      continue
    }

    if (token.startsWith('<!')) {
      continue
    }

    if (token.startsWith('</')) {
      const closingName = token.slice(2, -1).trim()
      const openNode = stack.pop()

      if (!openNode || openNode.tagName !== closingName) {
        throw new Error(
          `Invalid XML: closing tag </${closingName}> is not balanced.`,
        )
      }

      continue
    }

    if (token.startsWith('<')) {
      const selfClosing = /\/>\s*$/.test(token)
      const body = token.slice(1, selfClosing ? -2 : -1).trim()
      const nameMatch = body.match(/^([A-Za-z_][\w:.-]*)/)

      if (!nameMatch) {
        throw new Error('Invalid XML: element name could not be read.')
      }

      const node: XmlElementNode = {
        tagName: nameMatch[1],
        attributes: parseAttributes(body.slice(nameMatch[1].length)),
        children: [],
      }

      currentNode(stack).children.push(node)

      if (!selfClosing) {
        stack.push(node)
      }

      continue
    }

    currentNode(stack).children.push({ text: decodeXml(token) })
  }

  if (stack.length !== 1) {
    throw new Error('Invalid XML: one or more tags are not closed.')
  }

  const root = childElements(documentNode)[0]

  if (!root) {
    throw new Error('Invalid XML: no document element was found.')
  }

  return root
}

export function childElements(node: XmlElementNode): XmlElementNode[] {
  return node.children.filter(isElementNode)
}

export function childrenByName(
  node: XmlElementNode,
  name: string,
): XmlElementNode[] {
  return childElements(node).filter((child) => localName(child) === name)
}

export function descendantsByName(
  node: XmlElementNode,
  name: string,
): XmlElementNode[] {
  const descendants: XmlElementNode[] = []

  for (const child of childElements(node)) {
    if (localName(child) === name) {
      descendants.push(child)
    }

    descendants.push(...descendantsByName(child, name))
  }

  return descendants
}

export function firstChildText(
  node: XmlElementNode,
  name: string,
  preferredLanguage?: string,
): string | undefined {
  return selectByLanguage(childrenByName(node, name), preferredLanguage)
}

export function firstDescendantText(
  node: XmlElementNode,
  name: string,
  preferredLanguage?: string,
): string | undefined {
  return selectByLanguage(descendantsByName(node, name), preferredLanguage)
}

export function textContent(node: XmlElementNode): string {
  return normalizeWhitespace(
    node.children
      .map((child) => (isElementNode(child) ? textContent(child) : child.text))
      .join(' '),
  )
}

export function localName(node: XmlElementNode): string {
  return (
    node.tagName.split(':').pop()?.toLowerCase() ?? node.tagName.toLowerCase()
  )
}

export function attr(
  node: XmlElementNode,
  names: string | string[],
): string | undefined {
  const acceptedNames = Array.isArray(names) ? names : [names]
  const attribute = Object.entries(node.attributes).find(([key]) =>
    acceptedNames.some(
      (name) =>
        key.toLowerCase() === name.toLowerCase() ||
        key.split(':').pop()?.toLowerCase() === name.toLowerCase(),
    ),
  )

  return attribute?.[1]
}

export function parseVariableValue(value: string | undefined): VariableValue {
  const trimmedValue = value?.trim() ?? ''

  if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
    return Number(trimmedValue)
  }

  if (/^(true|false)$/i.test(trimmedValue)) {
    return /^true$/i.test(trimmedValue)
  }

  return trimmedValue
}

export function inferMissingCategory(label: string): MissingValueCategory {
  const normalizedLabel = label.toLowerCase()

  if (/(don'?t know|\bdk\b)/.test(normalizedLabel)) {
    return 'dont_know'
  }

  if (/(refus|declined)/.test(normalizedLabel)) {
    return 'refusal'
  }

  if (/(not applicable|n\/a|^na$)/.test(normalizedLabel)) {
    return 'not_applicable'
  }

  if (/(no response|not stated|missing)/.test(normalizedLabel)) {
    return 'item_nonresponse'
  }

  return 'other'
}

export function looksLikeMissingLabel(label: string): boolean {
  return /(^|\b)(don'?t know|refus(?:ed|al)?|not stated|not applicable|missing|no response)(\b|$)/i.test(
    label,
  )
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function currentNode(stack: XmlElementNode[]): XmlElementNode {
  const node = stack[stack.length - 1]

  if (!node) {
    throw new Error('Invalid XML: parser stack is empty.')
  }

  return node
}

function parseAttributes(attributeText: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  const attributePattern = /([A-Za-z_][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g
  let match: RegExpExecArray | null

  while ((match = attributePattern.exec(attributeText))) {
    attributes[match[1]] = decodeXml(match[3] ?? match[4] ?? '')
  }

  return attributes
}

function selectByLanguage(
  nodes: XmlElementNode[],
  preferredLanguage?: string,
): string | undefined {
  if (nodes.length === 0) {
    return undefined
  }

  const preferred = preferredLanguage?.toLowerCase()
  const selected =
    (preferred
      ? nodes.find((node) => readLanguage(node)?.toLowerCase() === preferred)
      : undefined) ??
    nodes.find((node) => !readLanguage(node)) ??
    nodes[0]

  return textContent(selected)
}

function readLanguage(node: XmlElementNode): string | undefined {
  return attr(node, ['lang', 'xml:lang'])
}

function isElementNode(
  node: XmlElementNode | XmlTextNode,
): node is XmlElementNode {
  return 'tagName' in node
}

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

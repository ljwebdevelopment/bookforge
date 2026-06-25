import type { OutlineNode } from '@/lib/types'

export function buildTree(flatNodes: OutlineNode[]): OutlineNode[] {
  const map = new Map<string, OutlineNode>()
  const roots: OutlineNode[] = []

  const nodes = flatNodes.map((n) => ({ ...n, children: [] as OutlineNode[] }))
  nodes.forEach((n) => map.set(n.id, n))

  nodes.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children!.push(n)
    } else {
      roots.push(n)
    }
  })

  const sortByOrder = (arr: OutlineNode[]) => {
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    arr.forEach((n) => { if (n.children) sortByOrder(n.children) })
    return arr
  }

  return sortByOrder(roots)
}

import {
  ModelSnapshot,
  SemanticModelLink,
  SemanticModelNode
} from './ft-generation.models';

function assertUniqueIds(values: readonly { id: string }[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value.id)) {
      throw new Error(`Duplicate ${label} id: ${value.id}`);
    }
    seen.add(value.id);
  }
}

export function createModelSnapshot(
  nodes: readonly SemanticModelNode[],
  links: readonly SemanticModelLink[],
  snapshotId = `snapshot-${Date.now()}`
): ModelSnapshot {
  assertUniqueIds(nodes, 'node');
  assertUniqueIds(links, 'link');

  const nodeIds = new Set(nodes.map(node => node.id));
  for (const link of links) {
    if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) {
      throw new Error(`Link ${link.id} references a missing node.`);
    }
  }

  return Object.freeze({
    snapshotId,
    createdAt: new Date().toISOString(),
    nodes: Object.freeze(nodes.map(node => Object.freeze({ ...node }))),
    links: Object.freeze(links.map(link => Object.freeze({ ...link })))
  });
}

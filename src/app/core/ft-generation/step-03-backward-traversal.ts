import {
  ModelSnapshot,
  SemanticModelLink,
  TraversalResult,
  UndesiredEvent
} from './ft-generation.models';

const TRAVERSABLE_LINKS = new Set(['PROCESS', 'SUPPORT', 'OFF_PAGE']);

export function traceBackward(
  snapshot: ModelSnapshot,
  undesiredEvent: UndesiredEvent
): TraversalResult {
  const nodes = new Map(snapshot.nodes.map(node => [node.id, node]));
  if (!nodes.has(undesiredEvent.testedNodeId)) {
    throw new Error(`Tested node not found: ${undesiredEvent.testedNodeId}`);
  }

  const incoming = new Map<string, SemanticModelLink[]>();
  for (const link of snapshot.links) {
    if (!TRAVERSABLE_LINKS.has(link.kind)) continue;
    const bucket = incoming.get(link.to) ?? [];
    bucket.push(link);
    incoming.set(link.to, bucket);
  }

  const visited = new Set<string>();
  const traversedLinks = new Set<string>();
  const terminals = new Set<string>();
  const warnings: string[] = [];
  const activePath = new Set<string>();

  const visit = (nodeId: string): void => {
    if (activePath.has(nodeId)) {
      warnings.push(`Cycle detected while tracing upstream at ${nodeId}.`);
      return;
    }
    if (visited.has(nodeId)) return;

    const node = nodes.get(nodeId);
    if (!node) return;

    visited.add(nodeId);
    activePath.add(nodeId);

    const stopRole =
      node.reliabilityRole === 'SOURCE' ||
      node.reliabilityRole === 'BOUNDARY' ||
      node.reliabilityRole === 'OFF_PAGE';

    if (stopRole) {
      terminals.add(nodeId);
      activePath.delete(nodeId);
      return;
    }

    const parents = incoming.get(nodeId) ?? [];
    if (parents.length === 0) {
      warnings.push(`Dead-end path at ${nodeId}; no upstream Source/Boundary was found.`);
      terminals.add(nodeId);
    }

    for (const link of parents) {
      traversedLinks.add(link.id);
      visit(link.from);
    }

    activePath.delete(nodeId);
  };

  visit(undesiredEvent.testedNodeId);

  return {
    startNodeId: undesiredEvent.testedNodeId,
    visitedNodeIds: [...visited],
    traversedLinkIds: [...traversedLinks],
    terminalNodeIds: [...terminals],
    warnings
  };
}

import {
  AvailabilityAtom,
  LogicExpression,
  ModelSnapshot,
  SemanticModelLink,
  SemanticModelNode,
  TraversalResult
} from './ft-generation.models';

const STRUCTURAL_ROLES = new Set([
  'NODE',
  'TARGET',
  'TESTER',
  'TEST_LINK',
  'FUNCTION_POINT'
]);

function and(children: readonly LogicExpression[]): LogicExpression {
  const meaningful = children.filter(child => child.kind !== 'TRUE');
  if (meaningful.some(child => child.kind === 'FALSE')) return { kind: 'FALSE' };
  if (meaningful.length === 0) return { kind: 'TRUE' };
  if (meaningful.length === 1) return meaningful[0];
  return { kind: 'AND', children: meaningful };
}

function or(children: readonly LogicExpression[]): LogicExpression {
  if (children.some(child => child.kind === 'TRUE')) return { kind: 'TRUE' };
  const meaningful = children.filter(child => child.kind !== 'FALSE');
  if (meaningful.length === 0) return { kind: 'FALSE' };
  if (meaningful.length === 1) return meaningful[0];
  return { kind: 'OR', children: meaningful };
}

function localAvailability(node: SemanticModelNode): LogicExpression | undefined {
  let atom: AvailabilityAtom | undefined;

  if (node.reliabilityRole === 'SOURCE') {
    atom = {
      kind: 'SOURCE_AVAILABLE',
      modelNodeId: node.id,
      kbClass: node.kbClass,
      description: `${node.name} source available`
    };
  } else if (node.reliabilityRole === 'FLAG') {
    atom = {
      kind: 'FLAG_ACTIVE',
      modelNodeId: node.id,
      kbClass: node.kbClass,
      description: `${node.name} condition active`
    };
  } else if (
    node.reliabilityRole === 'BOUNDARY' ||
    node.reliabilityRole === 'OFF_PAGE'
  ) {
    atom = {
      kind: 'BOUNDARY_AVAILABLE',
      modelNodeId: node.id,
      kbClass: node.kbClass,
      description: `${node.name} boundary available`
    };
  } else if (!node.reliabilityRole || !STRUCTURAL_ROLES.has(node.reliabilityRole)) {
    atom = {
      kind: 'COMPONENT_AVAILABLE',
      modelNodeId: node.id,
      kbClass: node.kbClass,
      description: `${node.name} available`
    };
  }

  return atom ? { kind: 'AVAILABILITY', atom } : undefined;
}

export function buildSuccessLogic(
  snapshot: ModelSnapshot,
  traversal: TraversalResult
): LogicExpression {
  const allowedNodes = new Set(traversal.visitedNodeIds);
  const allowedLinks = new Set(traversal.traversedLinkIds);
  const nodes = new Map(snapshot.nodes.map(node => [node.id, node]));
  const incoming = new Map<string, SemanticModelLink[]>();

  for (const link of snapshot.links) {
    if (!allowedLinks.has(link.id)) continue;
    const bucket = incoming.get(link.to) ?? [];
    bucket.push(link);
    incoming.set(link.to, bucket);
  }

  const active = new Set<string>();

  const build = (nodeId: string): LogicExpression => {
    const node = nodes.get(nodeId);
    if (!node || !allowedNodes.has(nodeId)) return { kind: 'FALSE' };

    if (active.has(nodeId)) return { kind: 'FALSE' };
    active.add(nodeId);

    const local = localAvailability(node);
    const parents = incoming.get(nodeId) ?? [];

    if (node.reliabilityRole === 'SOURCE') {
      active.delete(nodeId);
      return local ?? { kind: 'TRUE' };
    }

    const upstream: LogicExpression =
      parents.length === 0
        ? { kind: 'TRUE' }
        : or(parents.map(link => build(link.from)));

    active.delete(nodeId);
    return local ? and([local, upstream]) : upstream;
  };

  return build(traversal.startNodeId);
}

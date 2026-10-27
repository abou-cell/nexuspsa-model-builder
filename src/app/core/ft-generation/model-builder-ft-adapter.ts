import * as go from 'gojs';
import {
  FtGenerationArtifacts,
  SemanticModelLink,
  SemanticModelNode,
  UndesiredEvent
} from './ft-generation.models';
import { HYDRAULIC_V1_KB } from './knowledge-base.contract';
import { executeFtGenerationPipeline } from './ft-generation.pipeline';

export const GENERATED_FT_STORAGE_KEY = 'nexuspsa.generated-ft.v1';

interface RawNodeData {
  key: go.Key;
  name?: string;
  type?: string;
  category?: string;
  kbClass?: string;
  reliabilityRole?: SemanticModelNode['reliabilityRole'];
  testCriterion?: SemanticModelNode['testCriterion'];
}

interface RawLinkData {
  key?: go.Key;
  from: go.Key;
  to: go.Key;
  fromPort?: string;
  toPort?: string;
  pidClass?: string;
}

function hydraulicKbClass(type: string): string {
  const normalized = type.trim().toUpperCase();
  const aliases: Record<string, string> = {
    'MOTOR PUMP': 'HYDRAULIC.MOTOR_PUMP',
    'REHEATER': 'HYDRAULIC.REHEATER',
    'HEAT EXCHANGER': 'HYDRAULIC.REHEATER',
    'RESERVOIR': 'HYDRAULIC.RESERVOIR',
    'TANK': 'HYDRAULIC.TANK',
    'FILTER': 'HYDRAULIC.FILTER',
    'DIAPHRAGM': 'HYDRAULIC.DIAPHRAGM',
    'CHECK VALVE': 'HYDRAULIC.CHECK_VALVE',
    'MANUAL VALVE': 'HYDRAULIC.MANUAL_VALVE',
    'MOTORIZED VALVE': 'HYDRAULIC.MOTORIZED_VALVE',
    'RELIEF VALVE': 'HYDRAULIC.RELIEF_VALVE',
    'KD': 'HYDRAULIC.KD',
    'FIP': 'HYDRAULIC.FIP',
    'TRANSFER': 'HYDRAULIC.TRANSFER',
    'SOURCE': 'HYDRAULIC.SOURCE',
    'HYDRAULIC NODE / JUNCTION': 'HYDRAULIC.NODE',
    'HYDRAULIC TARGET / SINK': 'HYDRAULIC.TARGET',
    'TESTER': 'HYDRAULIC.TESTER'
  };
  return aliases[normalized] ?? `HYDRAULIC.${normalized.replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
}

function uniqueSemanticIds(nodes: readonly RawNodeData[]): Map<go.Key, string> {
  const used = new Set<string>();
  const result = new Map<go.Key, string>();

  for (const node of nodes) {
    const base = String(node.name ?? node.key)
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^A-Za-z0-9_.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `NODE-${String(node.key)}`;

    let id = base;
    let suffix = 2;
    while (used.has(id)) {
      id = `${base}-${suffix++}`;
    }
    used.add(id);
    result.set(node.key, id);
  }

  return result;
}

function isInstrumentationLink(link: RawLinkData): boolean {
  return String(link.pidClass ?? '').toLowerCase() === 'instrument';
}

function isLikelySource(node: RawNodeData, incomingCount: number): boolean {
  if (node.reliabilityRole === 'SOURCE') return true;
  if (incomingCount > 0) return false;
  return /SOURCE|RESERVOIR|TANK|SFP|ULTIMATE/i.test(`${node.type ?? ''} ${node.name ?? ''}`);
}

function isEligibleTarget(node: RawNodeData): boolean {
  if (node.reliabilityRole === 'TESTER' || node.reliabilityRole === 'SOURCE') return false;
  return !/FIP|INSTRUMENT|TESTER/i.test(node.type ?? '');
}

export function generateHydraulicFaultTreeFromDiagram(
  diagram: go.Diagram,
  systemId: string
): FtGenerationArtifacts {
  const model = diagram.model as go.GraphLinksModel;
  const rawNodes = (model.nodeDataArray as RawNodeData[]).filter(node => node.key !== undefined);
  const rawLinks = (model.linkDataArray as RawLinkData[]).filter(link => !isInstrumentationLink(link));

  if (rawNodes.length === 0) {
    throw new Error('The hydraulic diagram contains no components.');
  }

  const ids = uniqueSemanticIds(rawNodes);
  const incoming = new Map<go.Key, number>();
  const outgoing = new Map<go.Key, number>();

  for (const link of rawLinks) {
    incoming.set(link.to, (incoming.get(link.to) ?? 0) + 1);
    outgoing.set(link.from, (outgoing.get(link.from) ?? 0) + 1);
  }

  const selectedNode = diagram.selection.first() instanceof go.Node
    ? (diagram.selection.first() as go.Node).data as RawNodeData
    : undefined;

  const sinkCandidates = rawNodes.filter(node =>
    isEligibleTarget(node) &&
    (incoming.get(node.key) ?? 0) > 0 &&
    (outgoing.get(node.key) ?? 0) === 0
  );

  const targetRaw =
    selectedNode && isEligibleTarget(selectedNode) && (incoming.get(selectedNode.key) ?? 0) > 0
      ? selectedNode
      : sinkCandidates[sinkCandidates.length - 1]
        ?? rawNodes.find(node => isEligibleTarget(node) && (incoming.get(node.key) ?? 0) > 0);

  if (!targetRaw) {
    throw new Error('No hydraulic target could be identified. Select a downstream component and retry.');
  }

  const sourceKeys = new Set(
    rawNodes
      .filter(node => isLikelySource(node, incoming.get(node.key) ?? 0))
      .map(node => node.key)
  );

  if (sourceKeys.size === 0) {
    const zeroIncoming = rawNodes.filter(node => (incoming.get(node.key) ?? 0) === 0);
    zeroIncoming.forEach(node => sourceKeys.add(node.key));
  }

  const targetId = ids.get(targetRaw.key)!;
  const testerId = `${systemId}-FLOW-TESTER`;

  const nodes: SemanticModelNode[] = rawNodes.map(node => {
    const inferredRole = sourceKeys.has(node.key)
      ? 'SOURCE'
      : node.key === targetRaw.key
        ? 'TARGET'
        : node.reliabilityRole;

    return {
      id: ids.get(node.key)!,
      name: node.name ?? String(node.key),
      domain: 'hydraulic',
      type: node.type ?? node.category ?? 'Hydraulic Component',
      kbClass: node.kbClass ?? hydraulicKbClass(node.type ?? node.category ?? 'Hydraulic Component'),
      reliabilityRole: inferredRole,
      testCriterion: node.key === targetRaw.key ? 'FLOW_AVAILABLE' : node.testCriterion
    };
  });

  nodes.push({
    id: testerId,
    name: `${systemId} Flow Availability Tester`,
    domain: 'hydraulic',
    type: 'Tester',
    kbClass: 'HYDRAULIC.TESTER',
    reliabilityRole: 'TESTER',
    testCriterion: 'FLOW_AVAILABLE'
  });

  const links: SemanticModelLink[] = rawLinks
    .filter(link => ids.has(link.from) && ids.has(link.to))
    .map((link, index) => ({
      id: String(link.key ?? `PROCESS-${index + 1}`),
      from: ids.get(link.from)!,
      to: ids.get(link.to)!,
      kind: 'PROCESS',
      fromPort: link.fromPort,
      toPort: link.toPort
    }));

  links.push({
    id: `${systemId}-TEST-LINK`,
    from: targetId,
    to: testerId,
    kind: 'TEST'
  });

  const undesiredEvent: UndesiredEvent = {
    id: `UE-${systemId}-LOSS-FLOW`,
    name: `Loss of ${systemId} required flow`,
    description: `Automatically generated from the current ${systemId} hydraulic workspace.`,
    domain: 'hydraulic',
    testerNodeId: testerId,
    testedNodeId: targetId,
    criterion: 'FLOW_AVAILABLE',
    plantState: 'NORMAL'
  };

  return executeFtGenerationPipeline({
    undesiredEvent,
    nodes,
    links,
    knowledgeBase: HYDRAULIC_V1_KB,
    snapshotId: `${systemId}-LIVE-${Date.now()}`
  });
}

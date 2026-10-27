export type FtGenerationDomain = 'hydraulic' | 'electrical' | 'ic' | 'hvac';

export type ReliabilityRole =
  | 'SOURCE'
  | 'NODE'
  | 'TARGET'
  | 'TESTER'
  | 'TEST_LINK'
  | 'FLAG'
  | 'BOUNDARY'
  | 'OFF_PAGE'
  | 'FUNCTION_POINT'
  | 'LOGIC';

export type FtLinkKind = 'PROCESS' | 'SUPPORT' | 'TEST' | 'OFF_PAGE';

export type FtTestCriterion =
  | 'FLOW_AVAILABLE'
  | 'VOLTAGE_AVAILABLE'
  | 'SIGNAL_AVAILABLE'
  | 'AIRFLOW_AVAILABLE'
  | 'DELTA_P_AVAILABLE';

export interface SemanticModelNode {
  id: string;
  name: string;
  domain: FtGenerationDomain;
  type: string;
  kbClass: string;
  reliabilityRole?: ReliabilityRole;
  testCriterion?: FtTestCriterion;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface SemanticModelLink {
  id: string;
  from: string;
  to: string;
  kind: FtLinkKind;
  fromPort?: string;
  toPort?: string;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface UndesiredEvent {
  id: string;
  name: string;
  description?: string;
  domain: FtGenerationDomain;
  testerNodeId: string;
  testedNodeId: string;
  criterion: FtTestCriterion;
  plantState: string;
  missionTimeHours?: number;
}

export interface ModelSnapshot {
  snapshotId: string;
  createdAt: string;
  nodes: readonly SemanticModelNode[];
  links: readonly SemanticModelLink[];
}

export interface TraversalResult {
  startNodeId: string;
  visitedNodeIds: readonly string[];
  traversedLinkIds: readonly string[];
  terminalNodeIds: readonly string[];
  warnings: readonly string[];
}

export type AvailabilityAtomKind =
  | 'COMPONENT_AVAILABLE'
  | 'SOURCE_AVAILABLE'
  | 'FLAG_ACTIVE'
  | 'BOUNDARY_AVAILABLE';

export interface AvailabilityAtom {
  kind: AvailabilityAtomKind;
  modelNodeId: string;
  kbClass: string;
  description: string;
}

export type GeneratedEventCategory = 'BASIC_EVENT' | 'HOUSE_EVENT' | 'TRANSFER';

export interface FailureEventAtom {
  kind: 'FAILURE_EVENT';
  eventId: string;
  category: GeneratedEventCategory;
  description: string;
  modelNodeId?: string;
  kbClass?: string;
  kbFailureMode?: string;
}

export type LogicExpression =
  | { kind: 'TRUE' }
  | { kind: 'FALSE' }
  | { kind: 'AVAILABILITY'; atom: AvailabilityAtom }
  | { kind: 'FAILURE_EVENT'; atom: FailureEventAtom }
  | { kind: 'AND'; children: readonly LogicExpression[] }
  | { kind: 'OR'; children: readonly LogicExpression[] };

export interface FailureModeDefinition {
  code: string;
  description: string;
  basicEventSuffix: string;
}

export interface KnowledgeClassDefinition {
  classId: string;
  failureModes: readonly FailureModeDefinition[];
}

export interface TraceabilityRecord {
  generatedRecordId: string;
  modelNodeId?: string;
  kbClass?: string;
  kbFailureMode?: string;
  reason: string;
}

export type GeneratedGateType = 'OR' | 'AND' | 'KOFN';
export type GeneratedFaultTreeCategory =
  | 'TOP_EVENT'
  | 'GATE'
  | 'BASIC_EVENT'
  | 'HOUSE_EVENT'
  | 'TRANSFER';

export interface GeneratedFaultTreeNode {
  key: string;
  category: GeneratedFaultTreeCategory;
  id: string;
  description: string;
  state: 'NORMAL';
  gateType?: GeneratedGateType;
  recordType: 'GAT' | 'BEV' | 'HEV' | 'FTR';
  siblingOrder?: number;
}

export interface GeneratedFaultTreeLink {
  key: string;
  from: string;
  to: string;
  fromPort: 'OUT';
  toPort: 'IN';
}

export interface GeneratedFaultTreeModel {
  id: string;
  description: string;
  topGateId: string;
  nodes: GeneratedFaultTreeNode[];
  links: GeneratedFaultTreeLink[];
}

export interface GenerationValidationIssue {
  id: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  location: string;
}

export interface FtGenerationArtifacts {
  undesiredEvent: UndesiredEvent;
  snapshot: ModelSnapshot;
  traversal: TraversalResult;
  successLogic: LogicExpression;
  failureLogic: LogicExpression;
  faultTree: GeneratedFaultTreeModel;
  traceability: readonly TraceabilityRecord[];
  validation: readonly GenerationValidationIssue[];
}

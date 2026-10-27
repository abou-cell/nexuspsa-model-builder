import {
  SemanticModelLink,
  SemanticModelNode,
  UndesiredEvent
} from './ft-generation.models';
import { HYDRAULIC_V1_KB } from './knowledge-base.contract';
import { executeFtGenerationPipeline } from './ft-generation.pipeline';

export const PTR_LOSS_OF_FLOW_NODES: readonly SemanticModelNode[] = [
  {
    id: 'SFP',
    name: 'Spent Fuel Pool',
    domain: 'hydraulic',
    type: 'Source',
    kbClass: 'HYDRAULIC.SOURCE',
    reliabilityRole: 'SOURCE'
  },
  {
    id: 'PTR-PUMP-A',
    name: 'PTR Pump A',
    domain: 'hydraulic',
    type: 'Motor Pump',
    kbClass: 'HYDRAULIC.MOTOR_PUMP'
  },
  {
    id: 'PTR-VALVE-A',
    name: 'PTR Valve A',
    domain: 'hydraulic',
    type: 'Motorized Valve',
    kbClass: 'HYDRAULIC.MOTORIZED_VALVE'
  },
  {
    id: 'PTR-PUMP-B',
    name: 'PTR Pump B',
    domain: 'hydraulic',
    type: 'Motor Pump',
    kbClass: 'HYDRAULIC.MOTOR_PUMP'
  },
  {
    id: 'PTR-VALVE-B',
    name: 'PTR Valve B',
    domain: 'hydraulic',
    type: 'Motorized Valve',
    kbClass: 'HYDRAULIC.MOTORIZED_VALVE'
  },
  {
    id: 'PTR-JOIN',
    name: 'PTR discharge junction',
    domain: 'hydraulic',
    type: 'Hydraulic Node / Junction',
    kbClass: 'HYDRAULIC.NODE',
    reliabilityRole: 'NODE'
  },
  {
    id: 'PTR-FLOW-TARGET',
    name: 'PTR cooling flow target',
    domain: 'hydraulic',
    type: 'Hydraulic Target / Sink',
    kbClass: 'HYDRAULIC.TARGET',
    reliabilityRole: 'TARGET',
    testCriterion: 'FLOW_AVAILABLE'
  },
  {
    id: 'PTR-FLOW-TESTER',
    name: 'PTR flow tester',
    domain: 'hydraulic',
    type: 'Tester',
    kbClass: 'HYDRAULIC.TESTER',
    reliabilityRole: 'TESTER',
    testCriterion: 'FLOW_AVAILABLE'
  }
];

export const PTR_LOSS_OF_FLOW_LINKS: readonly SemanticModelLink[] = [
  { id: 'L-A1', from: 'SFP', to: 'PTR-PUMP-A', kind: 'PROCESS' },
  { id: 'L-A2', from: 'PTR-PUMP-A', to: 'PTR-VALVE-A', kind: 'PROCESS' },
  { id: 'L-A3', from: 'PTR-VALVE-A', to: 'PTR-JOIN', kind: 'PROCESS' },
  { id: 'L-B1', from: 'SFP', to: 'PTR-PUMP-B', kind: 'PROCESS' },
  { id: 'L-B2', from: 'PTR-PUMP-B', to: 'PTR-VALVE-B', kind: 'PROCESS' },
  { id: 'L-B3', from: 'PTR-VALVE-B', to: 'PTR-JOIN', kind: 'PROCESS' },
  { id: 'L-OUT', from: 'PTR-JOIN', to: 'PTR-FLOW-TARGET', kind: 'PROCESS' },
  { id: 'L-TEST', from: 'PTR-FLOW-TARGET', to: 'PTR-FLOW-TESTER', kind: 'TEST' }
];

export const PTR_LOSS_OF_FLOW_UE: UndesiredEvent = {
  id: 'UE-PTR-LOSS-FLOW',
  name: 'Loss of PTR cooling flow',
  description: 'Reference automatic FT generation vertical slice.',
  domain: 'hydraulic',
  testerNodeId: 'PTR-FLOW-TESTER',
  testedNodeId: 'PTR-FLOW-TARGET',
  criterion: 'FLOW_AVAILABLE',
  plantState: 'NORMAL'
};

export function runPtrLossOfFlowExample() {
  return executeFtGenerationPipeline({
    undesiredEvent: PTR_LOSS_OF_FLOW_UE,
    nodes: PTR_LOSS_OF_FLOW_NODES,
    links: PTR_LOSS_OF_FLOW_LINKS,
    knowledgeBase: HYDRAULIC_V1_KB,
    snapshotId: 'PTR-LOSS-FLOW-V1'
  });
}

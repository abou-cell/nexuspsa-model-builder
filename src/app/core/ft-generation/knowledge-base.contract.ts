import { KnowledgeClassDefinition } from './ft-generation.models';

export interface KnowledgeBaseProvider {
  getClass(classId: string): KnowledgeClassDefinition | undefined;
}

export class InMemoryKnowledgeBase implements KnowledgeBaseProvider {
  private readonly classes = new Map<string, KnowledgeClassDefinition>();

  constructor(definitions: readonly KnowledgeClassDefinition[]) {
    for (const definition of definitions) {
      this.classes.set(definition.classId, definition);
    }
  }

  getClass(classId: string): KnowledgeClassDefinition | undefined {
    return this.classes.get(classId);
  }
}

export const HYDRAULIC_V1_KB = new InMemoryKnowledgeBase([
  {
    classId: 'HYDRAULIC.MOTOR_PUMP',
    failureModes: [
      { code: 'FAIL_TO_START', description: 'Pump fails to start', basicEventSuffix: 'FTS' },
      { code: 'FAIL_TO_RUN', description: 'Pump fails to run during mission', basicEventSuffix: 'FTR' }
    ]
  },
  {
    classId: 'HYDRAULIC.MOTORIZED_VALVE',
    failureModes: [
      { code: 'FAIL_TO_OPEN', description: 'Motorized valve fails to open', basicEventSuffix: 'FTO' },
      { code: 'FAIL_TO_REMAIN_OPEN', description: 'Motorized valve fails to remain open', basicEventSuffix: 'FRO' }
    ]
  },
  {
    classId: 'HYDRAULIC.MANUAL_VALVE',
    failureModes: [
      { code: 'WRONG_POSITION', description: 'Manual valve unavailable in required position', basicEventSuffix: 'POS' }
    ]
  },
  {
    classId: 'HYDRAULIC.CHECK_VALVE',
    failureModes: [
      { code: 'FAIL_OPEN_PATH', description: 'Check valve prevents required forward flow', basicEventSuffix: 'FWD' }
    ]
  },
  {
    classId: 'HYDRAULIC.FILTER',
    failureModes: [
      { code: 'BLOCKED', description: 'Filter blocks required flow', basicEventSuffix: 'BLK' }
    ]
  },
  {
    classId: 'HYDRAULIC.REHEATER',
    failureModes: [
      { code: 'FLOW_PATH_BLOCKED', description: 'Heat exchanger flow path unavailable', basicEventSuffix: 'BLK' }
    ]
  }
]);

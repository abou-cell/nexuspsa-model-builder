import {
  FtGenerationArtifacts,
  SemanticModelLink,
  SemanticModelNode,
  UndesiredEvent
} from './ft-generation.models';
import { KnowledgeBaseProvider } from './knowledge-base.contract';
import { defineUndesiredEvent } from './step-01-undesired-event';
import { createModelSnapshot } from './step-02-model-snapshot';
import { traceBackward } from './step-03-backward-traversal';
import { buildSuccessLogic } from './step-04-success-logic';
import { buildFailureLogic } from './step-05-failure-logic';
import { toNextPsaFaultTree } from './step-06-nextpsa-ft-adapter';
import { validateGeneration } from './step-07-traceability-validation';

export interface ExecuteFtGenerationInput {
  undesiredEvent: UndesiredEvent;
  nodes: readonly SemanticModelNode[];
  links: readonly SemanticModelLink[];
  knowledgeBase: KnowledgeBaseProvider;
  snapshotId?: string;
}

export function executeFtGenerationPipeline(
  input: ExecuteFtGenerationInput
): FtGenerationArtifacts {
  const undesiredEvent = defineUndesiredEvent(input.undesiredEvent);
  const snapshot = createModelSnapshot(input.nodes, input.links, input.snapshotId);
  const traversal = traceBackward(snapshot, undesiredEvent);
  const successLogic = buildSuccessLogic(snapshot, traversal);
  const failureResult = buildFailureLogic(successLogic, input.knowledgeBase);
  const faultTree = toNextPsaFaultTree(undesiredEvent, failureResult.expression);
  const validation = validateGeneration(
    faultTree,
    traversal,
    failureResult.traceability,
    failureResult.warnings
  );

  return {
    undesiredEvent,
    snapshot,
    traversal,
    successLogic,
    failureLogic: failureResult.expression,
    faultTree,
    traceability: failureResult.traceability,
    validation
  };
}

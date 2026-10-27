import {
  GeneratedFaultTreeModel,
  GenerationValidationIssue,
  TraceabilityRecord,
  TraversalResult
} from './ft-generation.models';

export function validateGeneration(
  faultTree: GeneratedFaultTreeModel,
  traversal: TraversalResult,
  traceability: readonly TraceabilityRecord[],
  engineWarnings: readonly string[] = []
): GenerationValidationIssue[] {
  const issues: GenerationValidationIssue[] = [];

  traversal.warnings.forEach((message, index) => {
    issues.push({
      id: `TRAVERSAL-${index + 1}`,
      severity: message.includes('Cycle') ? 'ERROR' : 'WARNING',
      message,
      location: traversal.startNodeId
    });
  });

  engineWarnings.forEach((message, index) => {
    issues.push({
      id: `ENGINE-${index + 1}`,
      severity: 'WARNING',
      message,
      location: faultTree.id
    });
  });

  const generatedEvents = faultTree.nodes.filter(node =>
    node.category === 'BASIC_EVENT' ||
    node.category === 'HOUSE_EVENT' ||
    node.category === 'TRANSFER'
  );

  if (generatedEvents.length === 0) {
    issues.push({
      id: 'FT-NO-EVENTS',
      severity: 'ERROR',
      message: 'Generated Fault Tree contains no leaf events.',
      location: faultTree.id
    });
  }

  const tracedIds = new Set(traceability.map(record => record.generatedRecordId));
  for (const event of generatedEvents) {
    if (!tracedIds.has(event.id)) {
      issues.push({
        id: `TRACE-${event.key}`,
        severity: 'ERROR',
        message: `Generated event ${event.id} has no traceability record.`,
        location: event.key
      });
    }
  }

  return issues;
}

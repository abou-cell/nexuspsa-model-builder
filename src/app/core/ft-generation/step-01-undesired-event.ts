import { UndesiredEvent } from './ft-generation.models';

export function defineUndesiredEvent(input: UndesiredEvent): UndesiredEvent {
  const required = [
    input.id,
    input.name,
    input.domain,
    input.testerNodeId,
    input.testedNodeId,
    input.criterion,
    input.plantState
  ];

  if (required.some(value => !String(value).trim())) {
    throw new Error('Undesired Event is incomplete.');
  }

  if (input.missionTimeHours !== undefined && input.missionTimeHours <= 0) {
    throw new Error('missionTimeHours must be greater than zero when provided.');
  }

  return Object.freeze({ ...input });
}

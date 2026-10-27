# Step 01 — Undesired Event

## Purpose

Create the engineering question that starts automatic FT generation.

Example:

```text
UE-PTR-LOSS-FLOW
Loss of PTR cooling flow
Tester: PTR-FLOW-TESTER
Tested point: PTR-FLOW-TARGET
Criterion: FLOW_AVAILABLE
Plant state: NORMAL
```

## Required data

- stable Undesired Event ID;
- domain;
- Tester object ID;
- tested model object ID;
- test criterion;
- plant state / mission context;
- optional mission time and description.

## Rule

The engine must never infer the top event from a drawing title. Generation starts from an explicit semantic Undesired Event.

## TypeScript

Implemented by:

- `ft-generation.models.ts`
- `step-01-undesired-event.ts`

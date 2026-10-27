# Step 05 — Failure logic

## Purpose

Convert the success expression into the failure expression associated with the Undesired Event.

The transformation uses Boolean duality / De Morgan:

- `NOT(A AND B) = NOT A OR NOT B`
- `NOT(A OR B) = NOT A AND NOT B`

Component availability atoms are expanded using Knowledge Base failure modes.

Example:

```text
LOSS_OF_FLOW =
  LOSS_PATH_A
  AND
  LOSS_PATH_B

LOSS_PATH_A =
  SFP_UNAVAILABLE
  OR PUMP_A_FAIL_TO_START
  OR PUMP_A_FAIL_TO_RUN
  OR VALVE_A_FAIL_TO_OPEN
```

## Knowledge Base boundary

The graph engine knows that `PUMP_A` is class `HYDRAULIC.MOTOR_PUMP`. It does not hard-code pump failure modes. Those come from the Knowledge Base provider.

## TypeScript

Implemented by:

- `knowledge-base.contract.ts`
- `step-05-failure-logic.ts`

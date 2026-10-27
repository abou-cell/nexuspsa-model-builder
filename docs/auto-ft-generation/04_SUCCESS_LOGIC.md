# Step 04 — Success logic

## Purpose

Transform the traversed dependency graph into an explicit success expression.

## V1 grammar

- a physical component is available **AND** its required upstream supply/path is available;
- one incoming path means that path is required;
- multiple incoming paths at a structural junction mean alternative success paths: **OR**;
- a Source produces a `SOURCE_AVAILABLE` atom;
- a Flag produces a `FLAG_ACTIVE` atom;
- a Boundary/Off-page object produces a `BOUNDARY_AVAILABLE` atom.

Example:

```text
FLOW_AVAILABLE =
  (SFP_AVAILABLE AND PUMP_A_AVAILABLE AND VALVE_A_AVAILABLE)
  OR
  (SFP_AVAILABLE AND PUMP_B_AVAILABLE AND VALVE_B_AVAILABLE)
```

This expression is deliberately retained as an intermediate artefact. It is useful for debugging and for explaining why the generated FT contains a given event.

## TypeScript

Implemented by `step-04-success-logic.ts`.

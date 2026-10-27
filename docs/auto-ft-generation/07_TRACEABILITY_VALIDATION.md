# Step 07 — Traceability and validation

## Purpose

Every generated FT object must be explainable.

A generated Basic Event should be traceable through:

```text
Top Event
 -> failure expression
 -> success requirement
 -> model component
 -> kbClass
 -> Knowledge Base failure-mode rule
```

## Minimum trace record

- generated FT record ID;
- model node ID;
- KB class;
- KB failure-mode code;
- generation reason.

## Validation checks

V1 reports:

- missing tested node;
- missing KB class definition;
- dead-end path;
- cycle;
- generated FT with no Basic/House/Transfer events;
- generated records without traceability.

Warnings do not silently change the engineering model.

## TypeScript

Implemented by `step-07-traceability-validation.ts`.

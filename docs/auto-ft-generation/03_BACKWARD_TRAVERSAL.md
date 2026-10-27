# Step 03 — Backward traversal

## Purpose

Starting at the tested point, walk upstream through process and support dependencies until reaching Sources or explicit model boundaries.

```text
Tester -> tested point -> Node -> components -> Source
```

## Traversal rules

- traverse incoming `PROCESS` and `SUPPORT` links;
- ignore `TEST` links for physical success-path discovery;
- stop at `SOURCE`, `BOUNDARY` and `OFF_PAGE`;
- preserve every visited edge for traceability;
- detect cycles;
- report dead ends instead of inventing a source.

## Output

- visited nodes;
- traversed links;
- terminal sources/boundaries;
- warnings.

The traversal result is not yet a Fault Tree. It is the dependency subgraph needed to construct success logic.

## TypeScript

Implemented by `step-03-backward-traversal.ts`.

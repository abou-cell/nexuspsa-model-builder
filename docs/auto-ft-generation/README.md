# NexusPSA automatic Fault Tree generation

This folder defines the first implementation slice for a KB3/FIGARO-inspired workflow in NexusPSA:

```text
Model Builder
  -> Undesired Event
  -> model snapshot
  -> backward traversal
  -> success logic
  -> failure logic
  -> NextPSA FaultTreeModel
  -> GoJS Fault Tree editor
  -> validation / traceability
```

The implementation deliberately separates the graphical GoJS editors from the generation engine. GoJS is a renderer/editor; the generator operates on a semantic graph.

## Reuse already identified

The existing `abou-cell/nextpsa` repository already contains a usable FT target model and GoJS editor:

- `src/app/core/models/psa.models.ts`
- `src/app/gojs/fault-tree/fault-tree-editor.component.ts`
- `src/app/gojs/fault-tree/fault-tree-symbols.ts`
- `docs/gojs-fault-tree.md`

NexusPSA therefore generates a NextPSA-compatible intermediate `FaultTreeModel` instead of coupling the traversal engine to GoJS.

## Step files

1. `01_UNDESIRED_EVENT.md`
2. `02_MODEL_SNAPSHOT.md`
3. `03_BACKWARD_TRAVERSAL.md`
4. `04_SUCCESS_LOGIC.md`
5. `05_FAILURE_LOGIC.md`
6. `06_NEXTPSA_FT_ADAPTER.md`
7. `07_TRACEABILITY_VALIDATION.md`
8. `08_PTR_VERTICAL_SLICE.md`
9. `MASTER_IMPLEMENTATION_PROMPT.md`

The corresponding TypeScript implementation is isolated under `src/app/core/ft-generation/`.

## V1 assumptions

V1 is intentionally conservative:

- directed process/support links;
- no implicit physics solver;
- alternative upstream branches at a junction are interpreted as OR success paths;
- a component on a path is required in series with that path;
- component unavailability is expanded from the Knowledge Base;
- cycles are detected and reported instead of guessed;
- boundaries/off-page connectors remain explicit transfer events;
- plant-state flags are represented as House Events;
- generated records keep traceability back to the model object and KB rule.

These rules are enough to validate the end-to-end architecture on a hydraulic PTR loss-of-flow example before extending to Electrical, I&C and HVAC.

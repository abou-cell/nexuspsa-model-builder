# Master implementation prompt — Automatic Fault Tree generation

Use this prompt when implementing the next development increment.

---

You are implementing automatic Fault Tree generation in `abou-cell/nexuspsa-model-builder`.

Preserve the existing Hydraulic, Electrical, I&C and HVAC GoJS workspaces and their graphical behaviour. Do not make GoJS the reasoning engine.

Implement the pipeline in this exact order:

1. Create/validate an explicit Undesired Event containing tester, tested point, criterion and plant-state context.
2. Convert the Model Builder data into an immutable semantic graph snapshot.
3. Traverse upstream from the tested point over PROCESS/SUPPORT dependencies, stopping at Source/Boundary/Off-page nodes and reporting cycles/dead ends.
4. Build a neutral success expression. Components in series are AND requirements; alternative upstream branches at a structural junction are OR success paths.
5. Negate the success expression with Boolean duality. Resolve component-unavailability atoms from a Knowledge Base, producing Basic Events, House Events and Transfer events.
6. Convert the neutral failure expression into the same `FaultTreeModel` shape used in `abou-cell/nextpsa`.
7. Preserve traceability from each generated FT record to model object, KB class and KB failure-mode rule.
8. Validate before displaying or saving the FT.
9. Demonstrate the complete path with the PTR two-train loss-of-flow example.
10. Only after the semantic result is validated, port/reuse the existing NextPSA GoJS FT renderer/editor.

Existing reusable NextPSA files:
- `src/app/core/models/psa.models.ts`
- `src/app/gojs/fault-tree/fault-tree-editor.component.ts`
- `src/app/gojs/fault-tree/fault-tree-symbols.ts`
- `docs/gojs-fault-tree.md`

Existing NexusPSA semantic palette fields that must be preserved:
- `kbClass`
- `reliabilityRole`
- `testCriterion`

Do not infer undocumented nuclear-system success criteria. If the graph or KB is insufficient, return a validation issue and keep the result traceable.

The V1 target is not a complete KB3 replacement. The target is one correct vertical slice whose internal artefacts can be inspected:
`UndesiredEvent -> Snapshot -> Traversal -> SuccessLogic -> FailureLogic -> FaultTreeModel -> Traceability -> Validation`.

---

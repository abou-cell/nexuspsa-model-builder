# Step 08 — PTR loss-of-flow vertical slice

The first end-to-end demonstrator is intentionally small.

## Functional topology

```text
                  +-- PUMP-A -- VALVE-A --+
SFP SOURCE -------+                        +-- JOIN -- TARGET -- TESTER
                  +-- PUMP-B -- VALVE-B --+
```

## Undesired Event

```text
UE-PTR-LOSS-FLOW
criterion = FLOW_AVAILABLE
testedNodeId = PTR-FLOW-TARGET
```

## Expected success logic

```text
PATH_A_AVAILABLE OR PATH_B_AVAILABLE
```

## Expected failure top logic

```text
LOSS_PATH_A AND LOSS_PATH_B
```

Each path loss is an OR of the Source/component failure causes produced by the Knowledge Base.

## Acceptance criteria

1. pipeline executes without GoJS;
2. snapshot is deterministic;
3. traversal reaches the SFP Source through both branches;
4. success expression contains an OR between the two trains;
5. failure expression contains an AND between train-loss branches;
6. component failure modes become Basic Events;
7. the FT adapter emits a NextPSA-compatible model;
8. every generated event has traceability;
9. validation has no ERROR for the reference example.

The executable reference data is in `ptr-loss-of-flow.example.ts`.

# Step 02 — Semantic model snapshot

## Purpose

Freeze the current Model Builder state into a deterministic, serialisable graph before generation.

The snapshot contains semantic nodes and links only. GoJS visual objects are not passed to the engine.

## Node fields used by the generator

- `id`
- `domain`
- `type`
- `kbClass`
- `reliabilityRole`
- `testCriterion`
- optional metadata

## Link kinds

- `PROCESS`
- `SUPPORT`
- `TEST`
- `OFF_PAGE`

Only semantic topology is considered. Geometry, SVG source, zoom, location and selection state are irrelevant.

## Determinism

A generation run uses one immutable snapshot and receives a `snapshotId`. Future database persistence can store that ID with the generated FT revision.

## TypeScript

Implemented by `step-02-model-snapshot.ts`.

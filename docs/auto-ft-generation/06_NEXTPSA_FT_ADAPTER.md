# Step 06 — NextPSA Fault Tree adapter

## Purpose

Turn the neutral failure expression into a data model consumable by the existing NextPSA GoJS Fault Tree editor.

The target shape mirrors `abou-cell/nextpsa/src/app/core/models/psa.models.ts`:

- `FaultTreeModel`
- `FaultTreeNodeData`
- `FaultTreeLinkData`
- `GateType`
- `FaultTreeCategory`

## Important architecture decision

The generator does **not** instantiate GoJS nodes.

It emits a serialisable FT model. The editor is responsible for layout, user editing, record dialogs and visual representation.

This keeps three concerns independent:

```text
engineering semantics
    -> FT generation
        -> GoJS rendering/editing
```

## Migration path

When the automatic-generation vertical slice is validated, the reusable files from `abou-cell/nextpsa` can be ported into NexusPSA and the generated model passed directly to the editor component.

## TypeScript

Implemented by `step-06-nextpsa-ft-adapter.ts`.

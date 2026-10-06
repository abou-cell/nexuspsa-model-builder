# NexusPSA Model Builder

Standalone Angular + GoJS front-end for system modelling, designed to integrate later as a native feature of NextPSA.

## Compatibility
- Angular 22.2.0
- TypeScript 6.0.2
- GoJS 4.0.4
- Same `core / features / gojs` application structure as NextPSA
- Same visual design tokens as NextPSA

## Target integration
When stabilized, the feature folders can be integrated into NextPSA under:

- `src/app/features/model-builder/`
- `src/app/gojs/model-builder/`

The GoJS layer is kept separate from the domain/UI layer to avoid coupling the persisted model directly to diagram internals.

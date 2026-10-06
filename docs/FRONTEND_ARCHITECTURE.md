# NexusPSA Model Builder — Front-end Architecture

## Product objective

NexusPSA Model Builder is a graphical, knowledge-base-driven system modelling environment whose final objective is to generate Fault Trees from engineering system diagrams.

The front-end is developed as a standalone Angular application first, but it must remain structurally and visually compatible with NextPSA so it can later be merged as a native feature.

## Main workspaces

### 1. Hydraulic editor
Used for fluid systems such as PTR, RRI, RIS, SEC and similar systems.

Typical graphical objects:
- Pumps
- Motorized valves
- Manual valves
- Check valves
- Heat exchangers
- Tanks / pools
- Pipe junctions
- Hydraulic boundaries

### 2. Electrical editor
Used for electrical architecture and support dependencies.

Typical graphical objects:
- Busbars
- Breakers
- Transformers
- Motors
- Diesel generators
- Batteries
- Inverters
- Power supplies

### 3. I&C editor
Used for instrumentation, protection, automation and control logic.

Typical graphical objects:
- Sensors
- Transmitters
- Logic blocks
- Voting logic (1oo2, 2oo3, etc.)
- Relays
- Actuation signals
- I&C power supplies

### 4. HVAC editor
Used for ventilation and room cooling systems.

Typical graphical objects:
- Fans
- Dampers
- Filters
- Ducts
- Coolers
- Rooms
- Sensors
- Boundaries

### 5. Fault Tree generation workspace
Future workflow:
1. Select a system model.
2. Select an undesired event / mission.
3. Resolve component classes and ports from the Knowledge Base.
4. Apply domain propagation and failure rules.
5. Resolve support dependencies across hydraulic, electrical, I&C and HVAC models.
6. Build an intermediate logical representation.
7. Generate the Fault Tree.
8. Validate and review generation diagnostics.

### 6. Generated Fault Tree viewer
The generated FT viewer will reuse the visual principles and, where practical, the GoJS templates of the NextPSA Fault Tree editor. Generated trees should ultimately be transferable to the main NextPSA PSA model.

## Separation of responsibilities

The graphical model must not become the calculation model.

```text
Angular UI
   |
   +-- GoJS editors
   |      |
   |      +-- Hydraulic
   |      +-- Electrical
   |      +-- I&C
   |      +-- HVAC
   |
   +-- Knowledge Base UI
   |
   +-- FT Generation UI
   |
   +-- Generated FT Viewer
          |
          v
Domain model / API contract
          |
          v
Future generation engine
          |
          v
Fault Tree logical model
          |
          v
NextPSA FT model / calculation engine
```

GoJS is responsible for diagram interaction and visualization only. Engineering semantics, component definitions, failure modes, rules and FT-generation logic belong to the domain model / Knowledge Base and future backend services.

## NextPSA compatibility rules

- Angular 22.2.x
- TypeScript 6.0.x
- GoJS 4.0.x
- Same global CSS variables (`--nps-*`)
- Same application shell proportions and navigation style
- Feature code under `src/app/features`
- GoJS-specific rendering code under `src/app/gojs`
- Avoid coupling reusable domain objects directly to GoJS node data
- Keep API-facing DTOs independent from graphical templates

## Planned source structure

```text
src/app/
├── core/
├── features/
│   ├── model-builder/
│   │   ├── hydraulic/
│   │   ├── electrical/
│   │   ├── ic/
│   │   ├── hvac/
│   │   └── shared/
│   ├── knowledge-base/
│   ├── ft-generation/
│   └── generated-ft/
└── gojs/
    ├── model-builder/
    │   ├── hydraulic/
    │   ├── electrical/
    │   ├── ic/
    │   ├── hvac/
    │   └── shared/
    └── generated-ft/
```

The initial prototype currently shares one GoJS factory with domain-specific data. It can be progressively split into domain-specific templates as component semantics become mature.

# Action & Stuff — Ribbon Particle Reverse Engineering

**An in-depth investigation into how curved Ribbon Particles are constructed in Minecraft Bedrock Edition.**

[**🌐 View Live Documentation**](https://cbrusmcyt.github.io/bedrock-ribbon-particle/#home)

---

## Overview

This project documents the reverse engineering of the **Warden Soul Ribbon Particle** from the Action & Stuff resource pack for Minecraft Bedrock Edition.

The investigation focuses on understanding how a visually curved ribbon effect can be generated using nothing more than a straight PNG texture, particle emitters, billboards, and mathematical expressions written in Molang.

Rather than treating the effect as a black box, this project breaks down its internal structure, traces its particle execution flow, analyzes its obfuscated JSON definitions, and reconstructs the underlying logic with readable identifiers.

## What You'll Find

The documentation is divided into two main investigations:

### 1. Action & Stuff Ribbon Particle

An investigation into the original Warden Soul Ribbon implementation.

- **Reverse Engineering Process** — Step-by-step investigation of the original particle system.
- **Obfuscated Source Code** — Original JSON definitions with their obfuscated identifiers preserved.
- **Renamed Source Code** — A more readable version of the original implementation.
- **Rename Table** — Mapping between original identifiers and their reconstructed names.
- **Particle Execution Flow** — How parent emitters, child particles, animation controllers, and events interact.

### 2. Recreated Ribbon Particle

An independent reconstruction of the Ribbon Particle system.

- Single-file Soul Ribbon implementation.
- Readable Molang expressions and variable names.
- Reconstructed particle emission logic.
- Mathematical calculations behind the ribbon's movement.
- Explanation of how the implementation works.

---

## Key Discoveries

The investigation revealed several interesting details about the original implementation.

### A Straight Texture Creates a Curved Ribbon

The original texture is a simple **20 × 240 PNG strip**.

The curved appearance is not embedded in the texture or generated using a traditional mesh.

Instead, the effect is constructed from multiple short particle segments.

Each segment is rendered as a billboard, with its position and orientation calculated dynamically using Molang expressions.

### Parent–Child Particle Architecture

The original implementation uses two main particle components:

| Identifier      | Role                            |
| --------------- | ------------------------------- |
| `ribbon:endckw` | Parent emitter                  |
| `ribbon:wrbaad` | Child particle / ribbon segment |

The parent emitter periodically calculates segment parameters and passes them to child emitters through `pre_effect_expression`.

Each child represents a small section of the overall ribbon.

### Molang-Based Motion

The ribbon's movement is calculated using a mathematical expression that combines:

- Trigonometric functions.
- Exponential decay.
- Damped oscillation.
- Initial velocity.
- Directional transformations.
- Time-dependent interpolation.

These calculations allow the segments to follow a continuously changing trajectory.

### The Original System Is Not Just a Ribbon

The investigation also uncovered a separate particle chain responsible for the Warden's death effect, including particle dispatching and sound events.

This helped distinguish the standalone Ribbon Particle system from the larger Warden death-effect implementation.

---

## Reverse Engineering Methodology

The investigation followed a structured process:

1. Inspect the original texture and determine whether the curve exists in the image itself.
2. Examine particle JSON definitions.
3. Trace particle registrations inside `warden.json`.
4. Investigate animation controllers and animation files.
5. Search particle definitions for references to the missing variables.
6. Identify the parent emitter responsible for spawning ribbon segments.
7. Trace variable propagation through particle events.
8. Reconstruct the original logic using readable identifiers.
9. Build an independent implementation to understand the underlying mechanism.

The goal was not simply to rename obfuscated identifiers, but to understand the actual behavior of the system.

---

## Technical Details

| Component           | Description               |
| ------------------- | ------------------------- |
| Game Engine         | Minecraft Bedrock Edition |
| Particle System     | Bedrock Particle Effects  |
| Expression Language | Molang                    |
| Source Format       | JSON                      |
| Texture Format      | PNG                       |
| Rendering           | Billboard Particles       |
| Main Investigation  | Warden Soul Ribbon        |
| Reference Pack      | Action & Stuff            |

---

## Documentation

All investigation results, source code comparisons, reconstructed implementations, and rename references are available on the website.

**[Open the Interactive Documentation →](https://cbrusmcyt.github.io/bedrock-ribbon-particle/#home)**

The documentation includes both Bahasa Indonesia and English.

---

## Project Purpose

This project was created to explore the internal mechanics of Minecraft Bedrock's particle system through reverse engineering.

It aims to make complex particle implementations easier to understand, especially systems involving:

- Dynamic particle positioning.
- Procedural motion.
- Particle-to-particle communication.
- Molang mathematics.
- Billboard orientation.
- Complex particle execution chains.

The findings may also provide useful ideas for creating more advanced particle effects and experimenting with Minecraft Bedrock's technical capabilities.

---

## Credits & Disclaimer

- **Original Reference:** Action & Stuff resource pack.
- **Engine:** Minecraft Bedrock Edition.
- **Investigation, documentation, and recreated implementation:** CBrusMC.

This is an independent technical research and educational documentation project. It is not an official Action & Stuff or Mojang/Microsoft project and is not affiliated with or endorsed by its creators.

Original assets and implementations remain the property of their respective owners.

---

\<p align="center">&#x20; \*\*Reverse Engineer. Understand. Recreate.\*\*Made by **CBrusMC**\</p>

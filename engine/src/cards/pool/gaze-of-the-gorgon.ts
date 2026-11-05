import { defineCard } from "../define.js";

// Venomous Breath's delayed destroy: `blockedThisTurn` reads the whole turn's blocks, so
// blocks made before this spell count too (the ruling).

export default defineCard({
  name: "Gaze of the Gorgon",
  manaCost: "{3}{B/G}",
  colors: ["B", "G"],
  types: ["instant"],
  text:
    "({B/G} can be paid with either {B} or {G}.)\nRegenerate target creature. At this turn's next end of combat, destroy all creatures that blocked or were blocked by it this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "regenerate", target: 0 },
      {
        kind: "delayed-trigger",
        at: "end-of-combat-this-turn",
        effect: {
          kind: "destroy-all",
          filter: { type: "creature", blockedThisTurn: { relation: "either", of: 0 } },
        },
        text: "Destroy all creatures that blocked or were blocked by it this turn.",
      },
    ],
  },
});

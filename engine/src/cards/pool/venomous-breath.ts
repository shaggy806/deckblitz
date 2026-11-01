import { defineCard } from "../define.js";

// Fired at this turn's next end of combat, or never if there's none left. It
// reads the blocks of the whole turn as it resolves, so the target needn't have
// blocked yet when this was cast, and needn't still be there at the end.

export default defineCard({
  name: "Venomous Breath",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target creature. At this turn's next end of combat, destroy all creatures that blocked or were blocked by it this turn.",
  targets: ["creature"],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat-this-turn",
    effect: {
      kind: "destroy-all",
      filter: { type: "creature", blockedThisTurn: { relation: "either", of: 0 } },
    },
    text: "Destroy all creatures that blocked or were blocked by it this turn.",
  },
});

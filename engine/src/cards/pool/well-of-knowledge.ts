import { defineCard } from "../define.js";

// "Any player may activate this ability but only during their draw step":
// `anyPlayer`, whose condition reads "your" as the activator's.

const TEXT = "{2}: Draw a card. Any player may activate this ability but only during their draw step.";

export default defineCard({
  name: "Well of Knowledge",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      anyPlayer: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["draw"] }] },
      text: TEXT,
    },
  ],
});

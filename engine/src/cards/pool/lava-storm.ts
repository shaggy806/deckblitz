import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 29564. "Or" with no "choose one": the
// choice is made as it resolves (rule 608.2d), an unannounced `modal`.

export default defineCard({
  name: "Lava Storm",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Lava Storm deals 2 damage to each attacking creature or Lava Storm deals 2 damage to each blocking creature.",
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Lava Storm deals 2 damage to each attacking creature.",
        effect: { kind: "damage-all", amount: 2, filter: { type: "creature", attacking: true } },
      },
      {
        text: "Lava Storm deals 2 damage to each blocking creature.",
        effect: { kind: "damage-all", amount: 2, filter: { type: "creature", blocking: true } },
      },
    ],
  },
});

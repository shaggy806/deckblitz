import { defineCard } from "../define.js";

// EDHREC rank 28872.

export default defineCard({
  name: "Halt Order",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target artifact spell.\nDraw a card.",
  targets: [{ kind: "spell", filter: { type: "artifact" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});

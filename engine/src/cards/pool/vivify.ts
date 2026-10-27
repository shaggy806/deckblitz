import { defineCard } from "../define.js";

// EDHREC rank 29853.

export default defineCard({
  name: "Vivify",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target land becomes a 3/3 creature until end of turn. It's still a land.\nDraw a card.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

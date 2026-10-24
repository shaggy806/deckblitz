import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 27675.

export default defineCard({
  name: "Roiling Waters",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to two target creatures your opponents control to their owners' hands. Target player draws two cards.",
  targets: [...distinctTargets(2, "creature-an-opponent-controls", { optional: true }), "player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      { kind: "draw", amount: 2, target: 2 },
    ],
  },
});

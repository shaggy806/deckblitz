import { defineCard } from "../define.js";

// EDHREC rank 15971.
export default defineCard({
  name: "Roku's Mastery",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Roku's Mastery deals X damage to target creature. If X is 4 or more, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 4 } },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});

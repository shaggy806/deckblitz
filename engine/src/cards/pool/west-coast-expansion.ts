import { defineCard } from "../define.js";

// EDHREC rank 14836. Marvel Super Heroes Commander.

const TEXT =
  "Draw X cards. If X is 5 or more, you may cast a Hero spell from your hand without paying its mana cost.";

export default defineCard({
  name: "West Coast Expansion",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x" },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 5 } },
        then: { kind: "cast-now", from: "hand", free: true, spell: { subtype: "Hero" } },
      },
    ],
  },
});

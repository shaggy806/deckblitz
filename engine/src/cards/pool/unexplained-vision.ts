import { defineCard } from "../define.js";

const ADAMANT = "Adamant — If at least three blue mana was spent to cast this spell, scry 3.";

export default defineCard({
  name: "Unexplained Vision",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Draw three cards.\n${ADAMANT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { U: 3 } } },
        then: { kind: "scry", amount: 3 },
      },
    ],
  },
});

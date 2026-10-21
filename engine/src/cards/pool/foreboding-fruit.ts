import { defineCard } from "../define.js";

// Adamant: the black mana spent to cast it, read as it resolves; the Food
// comes even if another player drew (its ruling).
const ADAMANT =
  "Adamant — If at least three black mana was spent to cast this spell, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Foreboding Fruit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Target player draws two cards and loses 2 life.\n${ADAMANT}`,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "lose-life", amount: 2, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { B: 3 } } },
        then: { kind: "create-token", token: "Food Token", count: 1 },
      },
    ],
  },
});

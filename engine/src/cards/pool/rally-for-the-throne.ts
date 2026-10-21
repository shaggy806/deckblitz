import { defineCard } from "../define.js";

// The life is counted after the Humans are made (the rulings: in order).
const ADAMANT =
  "Adamant — If at least three white mana was spent to cast this spell, you gain 1 life for each creature you control.";

export default defineCard({
  name: "Rally for the Throne",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Create two 1/1 white Human creature tokens.\n${ADAMANT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Human Token", count: 2 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { W: 3 } } },
        then: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      },
    ],
  },
});

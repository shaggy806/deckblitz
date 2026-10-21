import { defineCard } from "../define.js";

const ADAMANT =
  "Adamant — If at least three blue mana was spent to cast this spell, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Turn into a Pumpkin",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Return target nonland permanent to its owner's hand. Draw a card.\n${ADAMANT}`,
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { U: 3 } } },
        then: { kind: "create-token", token: "Food Token", count: 1 },
      },
    ],
  },
});

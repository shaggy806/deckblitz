import { defineCard } from "../define.js";

// EDHREC rank 10799.
//
// The mana-value cap is a live `{ amount }` operand (Winter Soldier's shape)
// counting the Plains you control — Plains by subtype, so a nonbasic Plains
// counts — read as it's cast and again as the target is rechecked on
// resolution. The life goes to the creature's controller as it last existed
// (Swords to Plowshares' `toControllerOfTarget`).

const TEXT =
  "Exile target creature with mana value less than or equal to the number of Plains you control. Its controller gains 3 life.";

export default defineCard({
  name: "Lay Down Arms",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "permanent",
      filter: {
        type: "creature",
        manaValue: { op: "lte", n: { amount: { countOf: { subtype: "Plains", controlledBy: "you" } } } },
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
    ],
  },
});

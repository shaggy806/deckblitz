import { defineCard } from "../define.js";

const TEXT =
  "Choose target creature, planeswalker, or Vehicle. Mill two cards, then destroy the chosen permanent if its mana value is less than or equal to the number of cards in your graveyard.";

export default defineCard({
  name: "Quag Feast",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "creature" }, { type: "planeswalker" }, { subtype: "Vehicle" }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 2 },
      {
        // Read after the mill, as the spell is still on the stack (it isn't
        // in the graveyard yet to count itself).
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: { manaValue: { op: "lte", n: { amount: { countInGraveyard: { ownedBy: "you" } } } } },
        },
        then: { kind: "destroy", target: 0 },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// Theros Beyond Death. The type check reads the exiled card (an enchantment
// creature card is a creature card: life, no draw — its ruling).

export default defineCard({
  name: "Cling to Dust",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target card from a graveyard. If it was a creature card, you gain 3 life. Otherwise, you draw a card.\nEscape—{3}{B}, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: { kind: "gain-life", amount: 3 },
        else: { kind: "draw", amount: 1 },
      },
    ],
  },
  escape: { cost: "{3}{B}", exileCount: 5 },
});

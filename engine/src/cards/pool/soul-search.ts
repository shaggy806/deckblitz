import { defineCard } from "../define.js";

// EDHREC rank 23662.
//
// The exiled card's mana value is read where it went (X is 0 in exile, and a card
// with no mana cost is 0 — the rulings).
export default defineCard({
  name: "Soul Search",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. Exile that card. If the card's mana value is 1 or less, create a 1/1 white and black Spirit creature token with flying.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile", unlinked: true },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", filter: { manaValue: { op: "lte", n: 1 } } },
        then: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
      },
    ],
  },
});

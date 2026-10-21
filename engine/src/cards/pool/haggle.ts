import { defineCard } from "../define.js";

export default defineCard({
  name: "Haggle",
  art: "https://cards.scryfall.io/art_crop/back/0/b/0b4399b6-e67f-40d8-8676-f5db7e04a6c9.jpg",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "You may discard a card. If you do, draw a card. (Then exile this card. You may cast the creature later from exile.)",
  effect: {
    kind: "may",
    prompt: "Discard a card to draw a card?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard", target: "you", amount: 1 },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "discarded" },
          then: { kind: "draw", amount: 1 },
        },
      ],
    },
  },
  faces: ["Merchant of the Vale", "Haggle"],
  adventure: true,
});

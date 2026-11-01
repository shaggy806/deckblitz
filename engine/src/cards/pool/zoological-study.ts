import { defineCard } from "../define.js";

// Monster Manual's Adventure. "Return a creature card milled this way" is a
// choice over the milled cards (`thisWay: "milled"`), not optional: one must
// be taken when there is one. A milled card a replacement exiled instead is
// still found (rule 701.17c).

export default defineCard({
  name: "Zoological Study",
  art: "https://cards.scryfall.io/art_crop/back/2/7/27223ee4-970a-438a-beff-a1b13b14aff4.jpg",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Mill five cards, then return a creature card milled this way to your hand. (Then exile this card. You may cast the artifact later from exile.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 5 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { thisWay: "milled", type: "creature" },
      },
    ],
  },
  faces: ["Monster Manual", "Zoological Study"],
  adventure: true,
});

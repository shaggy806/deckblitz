import { defineCard } from "../define.js";

// Thranduil, Sindarin Liege's Adventure. "From among them" is the cards
// milled this way (Smuggler's Surprise's shape): up to two land cards among
// them, the rest staying in the graveyard.
export default defineCard({
  name: "Silvan Rally",
  art: "https://cards.scryfall.io/art_crop/back/4/8/481870ee-d1f7-421b-86e1-570ea933bbbc.jpg",
  manaCost: "{1}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Mill four cards, then put up to two land cards from among them into your hand. (Then exile this card. You may cast the creature later from exile.)",
  faces: ["Thranduil, Sindarin Liege", "Silvan Rally"],
  adventure: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 2,
        destination: "hand",
        leftover: "stay",
        filter: { thisWay: "milled", type: "land" },
      },
    ],
  },
});

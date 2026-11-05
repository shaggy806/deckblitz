import { defineCard } from "../define.js";

// The Adventure half of Glamdring, Foe-hammer: every instant and sorcery card
// among the six milled goes to the hand (Cantankerous Keepers' shape).

export default defineCard({
  name: "Gleam of Death",
  art: "https://cards.scryfall.io/art_crop/back/a/5/a5cfbfde-783e-46ca-b3cf-11f16209d6cb.jpg",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Mill six cards, then put all instant and sorcery cards from among them into your hand. (Then exile this card. You may cast the artifact later from exile.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 6 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 6,
        max: 6,
        destination: "hand",
        leftover: "stay",
        filter: { thisWay: "milled", typesAnyOf: ["instant", "sorcery"] },
      },
    ],
  },
  faces: ["Glamdring, Foe-hammer", "Gleam of Death"],
  adventure: true,
});

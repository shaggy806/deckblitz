import { defineCard } from "../define.js";


export default defineCard({
  name: "Speak Secrets",
  art: "https://cards.scryfall.io/art_crop/back/2/d/2d838feb-89f2-4cdb-a5ab-ec880f28d873.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Mill four cards, then put an instant or sorcery card from among them into your hand.",
  faces: ["Most Decrepit Old Bird", "Speak Secrets"],
  adventure: true,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { thisWay: "milled", typesAnyOf: ["instant", "sorcery"] },
      },
    ],
  },
});

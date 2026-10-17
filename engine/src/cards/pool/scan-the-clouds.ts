import { defineCard } from "../define.js";

export default defineCard({
  name: "Scan the Clouds",
  art: "https://cards.scryfall.io/art_crop/back/5/5/559bacc8-facc-4d93-90b5-8ac21d3246f5.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Draw two cards, then discard two cards. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 2 },
    ],
  },
  faces: ["Tempest Hart", "Scan the Clouds"],
  adventure: true,
});

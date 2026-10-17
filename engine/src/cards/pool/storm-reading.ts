import { defineCard } from "../define.js";

export default defineCard({
  name: "Storm Reading",
  art: "https://cards.scryfall.io/art_crop/back/6/0/60976109-30ad-4f12-99eb-c5ef560fcf1b.jpg",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Draw four cards, then discard two cards. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "discard", target: "you", amount: 2 },
    ],
  },
  faces: ["Galvanic Giant", "Storm Reading"],
  adventure: true,
});

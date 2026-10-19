import { defineCard } from "../define.js";

export default defineCard({
  name: "Sand Augury",
  art: "https://cards.scryfall.io/art_crop/back/5/6/56b0f66b-dca9-4a01-9394-20a513c2b225.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Scry 1, then draw a card. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
  faces: ["Young Blue Dragon", "Sand Augury"],
  adventure: true,
});

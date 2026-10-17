import { defineCard } from "../define.js";


export default defineCard({
  name: "Stoke Genius",
  art: "https://cards.scryfall.io/art_crop/back/a/8/a8f5f102-cc75-4cee-a117-4bdaaf86c2e9.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Discard your hand, then draw two cards. (Then exile this card. You may cast the creature later from exile.)",
  faces: ["Hearth Elemental", "Stoke Genius"],
  adventure: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: 2 },
    ],
  },
});

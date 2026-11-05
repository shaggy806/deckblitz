import { defineCard } from "../define.js";

export default defineCard({
  name: "Granted",
  art: "https://cards.scryfall.io/art_crop/back/e/3/e3435fd6-8f51-4d99-a278-4ddb088acfe1.jpg",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "You may reveal a noncreature card you own from outside the game and put it into your hand.",
  effect: {
    kind: "search-library",
    filter: { notTypes: ["creature"] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    outside: "only",
  },
  faces: ["Fae of Wishes", "Granted"],
  adventure: true,
});

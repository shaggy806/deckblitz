import { defineCard } from "../define.js";

// EDHREC rank 14080.
// "Snow permanent cards" — a snow card of a permanent type (rule 110.4).

export default defineCard({
  name: "Glacial Revelation",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top six cards of your library. You may put any number of snow permanent cards from among them into your hand. Put the rest into your graveyard.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 6,
    reveal: true,
    min: 0,
    max: 6,
    destination: "hand",
    leftover: "graveyard",
    filter: {
      supertype: "snow",
      typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
    },
  },
});

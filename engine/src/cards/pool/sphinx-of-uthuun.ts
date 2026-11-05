import { defineCard } from "../define.js";


export default defineCard({
  name: "Sphinx of Uthuun",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, reveal the top five cards of your library. An opponent separates those cards into two piles. Put one pile into your hand and the other into your graveyard.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "separate-into-piles",
        objects: { libraryTop: 5, reveal: true },
        separator: "an-opponent",
        chooser: "you",
        chosen: "hand",
        rest: "graveyard",
      },
      resolve: null,
      text: "When this creature enters, reveal the top five cards of your library. An opponent separates those cards into two piles. Put one pile into your hand and the other into your graveyard.",
    },
  ],
});

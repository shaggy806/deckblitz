import { defineCard } from "../define.js";

// EDHREC rank 2584. The finds' total mana value is checked as a set (X is 0 in
// a library, the ruling).
export default defineCard({
  name: "Protean Hulk",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: "When this creature dies, search your library for any number of creature cards with total mana value 6 or less, put them onto the battlefield, then shuffle.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature" },
        destination: "battlefield",
        min: 0,
        max: { librarySize: "you" },
        together: { totalManaValueAtMost: 6 },
      },
      resolve: null,
      text: "When this creature dies, search your library for any number of creature cards with total mana value 6 or less, put them onto the battlefield, then shuffle.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 25184.
//
// Rulings:
//   [2009-10-01] Despite the similarities between horsemanship and flying, horsemanship doesn’t
//     interact with flying or reach.

export default defineCard({
  name: "Yuan Shao, the Indecisive",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nEach creature you control can't be blocked by more than one creature.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      blockedByAtMostOne: true,
      text: "Each creature you control can't be blocked by more than one creature.",
    },
  ],
});

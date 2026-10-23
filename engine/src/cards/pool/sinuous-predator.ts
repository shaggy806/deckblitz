import { defineCard } from "../define.js";

// The back face of Kessig Prowler.
//
// Rulings:
//   [2016-07-13] If Sinuous Predator gains menace, it can't be blocked by only one creature and it
//     can't be blocked by more than one creature, so it simply can't be blocked.

export default defineCard({
  name: "Sinuous Predator",
  art: "https://cards.scryfall.io/art_crop/back/f/8/f89f116a-1e8e-4ae7-be39-552e4954f229.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 4,
  toughness: 4,
  text: "This creature can't be blocked by more than one creature.",
  static: [
    {
      affects: { scope: "self" },
      blockedByAtMostOne: true,
      text: "This creature can't be blocked by more than one creature.",
    },
  ],
  faces: ["Kessig Prowler", "Sinuous Predator"],
  transform: true,
});

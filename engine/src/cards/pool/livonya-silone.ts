import { defineCard } from "../define.js";

// EDHREC rank 30486. Legendary landwalk: landwalk whose land is a legendary
// land (rule 702.14c) — a legendary nonland permanent doesn't count.
//
// Rulings:
//   "Legendary landwalk" means "This creature is can't be blocked as long as defending player
//     controls a legendary land."

export default defineCard({
  name: "Livonya Silone",
  manaCost: "{2}{R}{R}{G}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: "First strike; legendary landwalk (This creature can't be blocked as long as defending player controls a legendary land.)",
  static: [
    {
      affects: { scope: "self" },
      landwalk: { type: "land", supertype: "legendary" },
      text: "Legendary landwalk",
    },
  ],
});

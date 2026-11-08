import { defineCard } from "../define.js";

// EDHREC rank 22961. Legendary landwalk (rule 702.14c).
//
// Rulings:
//   Nonland legendary permanents don't affect whether Ayumi can be blocked or not, only legendary
//     lands.

export default defineCard({
  name: "Ayumi, the Last Visitor",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 7,
  toughness: 3,
  text: "Legendary landwalk (This creature can't be blocked as long as defending player controls a legendary land.)",
  static: [
    {
      affects: { scope: "self" },
      landwalk: { type: "land", supertype: "legendary" },
      text: "Legendary landwalk",
    },
  ],
});

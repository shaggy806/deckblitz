import { defineCard } from "../define.js";

// EDHREC rank 31938. Snow forestwalk: landwalk whose land is a snow Forest
// (rule 702.14c) — not a non-snow Forest (the ruling).
//
// Rulings:
//   Can't landwalk through a non-Snow Forest.

export default defineCard({
  name: "Rime Dryad",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 1,
  toughness: 2,
  text: "Snow forestwalk (This creature can't be blocked as long as defending player controls a snow Forest.)",
  static: [
    {
      affects: { scope: "self" },
      landwalk: { type: "land", supertype: "snow", subtype: "Forest" },
      text: "Snow forestwalk",
    },
  ],
});

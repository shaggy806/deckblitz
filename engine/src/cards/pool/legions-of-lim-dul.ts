import { defineCard } from "../define.js";

// EDHREC rank 31587. Snow swampwalk: landwalk whose land is a snow Swamp
// (rule 702.14c).

export default defineCard({
  name: "Legions of Lim-Dûl",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: "Snow swampwalk (This creature can't be blocked as long as defending player controls a snow Swamp.)",
  static: [
    {
      affects: { scope: "self" },
      landwalk: { type: "land", supertype: "snow", subtype: "Swamp" },
      text: "Snow swampwalk",
    },
  ],
});

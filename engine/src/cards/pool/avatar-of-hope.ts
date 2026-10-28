import { defineCard } from "../define.js";

// EDHREC rank 25696.
//
// Rulings:
//   [2004-10-04] The mana value of this card is still 8, even if you only pay {W}{W} to cast it.

export default defineCard({
  name: "Avatar of Hope",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 9,
  keywords: ["flying"],
  text: "If you have 3 or less life, this spell costs {6} less to cast.\nFlying\nThis creature can block any number of creatures.",
  selfCostReduction: {
    condition: { kind: "life-total", who: "you", atMost: 3 },
    reduceGeneric: 6,
  },
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: "any",
      text: "This creature can block any number of creatures.",
    },
  ],
});

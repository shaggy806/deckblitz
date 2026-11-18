import { defineCard } from "../define.js";

// EDHREC rank 15341. A characteristic-defining ability (rule 604.3), so it
// works in every zone: "you" is its controller, its owner off the battlefield,
// and the cards it counts are the cards that player owns in exile — face-down
// ones too, whose owner is no characteristic (rules 109.3, 406.3a), and in
// exile it counts itself (the ruling). Lhurgoyf's +1 toughness.
//
// Rulings:
//   - The ability that defines Cosmogoyf's power and toughness works in all zones, not just the
//     battlefield. If Cosmogoyf is in exile, its ability will count itself.

const TEXT =
  "Cosmogoyf's power is equal to the number of cards you own in exile and its toughness is equal to that number plus 1.";

export default defineCard({
  name: "Cosmogoyf",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elemental", "Lhurgoyf"],
  power: 0,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "count", filter: { ownedBy: "you" }, in: "exile" },
        plusPower: 0,
        plusToughness: 1,
      },
      text: TEXT,
    },
  ],
});

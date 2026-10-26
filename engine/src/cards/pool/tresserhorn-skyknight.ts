import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 31062.
//
// Rulings:
//   [2006-07-15] Damage that would be dealt to Tresserhorn Skyknight by creatures with double
//     strike is dealt as normal.
//   [2006-07-15] All damage (not just combat damage and not just first-strike combat damage)
//     that would be dealt by creatures with first strike is prevented.
//
// A double striker doesn't have first strike (rule 702.4), so the `keyword`
// clause leaves it out.

const TEXT = "Prevent all damage that would be dealt to this creature by creatures with first strike.";

export default defineCard({
  name: "Tresserhorn Skyknight",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Knight"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        to: "self",
        source: { types: ["creature"], keyword: "first-strike" },
      },
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Rulings:
//   [2024-11-08] A spell or ability that counters spells can still target Sphinx of the Final Word
//     or any other spell that can't be countered. When that spell or ability resolves, the spell
//     won't be countered, but any additional effects of the countering spell or ability will still
//     happen.

const STATIC_TEXT = "Instant and sorcery spells you control can't be countered.";

export default defineCard({
  name: "Sphinx of the Final Word",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "hexproof"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nFlying\nHexproof (This creature can't be the target of spells or abilities your opponents control.)\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { typesAnyOf: ["instant", "sorcery"] }, cantBeCountered: true },
      text: STATIC_TEXT,
    },
  ],
});

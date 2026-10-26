import { defineCard } from "../define.js";

// EDHREC rank 26837.
//
// Rulings:
//   [2004-10-04] The ability is a replacement effect which is applied when damage would become
//     dealt.
//   [2004-10-04] If the red spell damages more than one target, add 1 to each target.
//
// A spell dealing damage is an instant or sorcery (a permanent spell deals
// none from the stack — Benevolent Unicorn's shape), whoever controls it.

const TEXT =
  "If a red spell would deal damage to a permanent or player, it deals that much damage plus 1 to that permanent or player instead.";

export default defineCard({
  name: "Sulfuric Vapors",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: 1,
        source: { colors: ["R"], typesAnyOf: ["instant", "sorcery"] },
      },
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 28244.
//
// Rulings:
//   [2016-06-08] Activated abilities contain a colon.
//
// "Its activated abilities": the host's alone, whoever activates them — mana
// abilities included.

const LOCK_TEXT = "Enchanted artifact can't attack or block, and its activated abilities can't be activated.";

export default defineCard({
  name: "Stasis Cocoon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${LOCK_TEXT}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: LOCK_TEXT,
    },
  ],
});

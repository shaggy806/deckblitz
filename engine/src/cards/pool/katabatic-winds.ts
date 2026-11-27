import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 26938.
//
// Serra Bestiary's static over every creature with flying (read through the
// layer fold, so one granted flying is caught and one that lost it isn't):
// it can't attack or block, and its activated abilities with {T} in their
// costs — mana abilities among them — can't be activated (rule 602.5).

const STATIC_TEXT =
  "Creatures with flying can't attack or block, and their activated abilities with {T} in their costs can't be activated.";

export default defineCard({
  name: "Katabatic Winds",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  keywords: ["phasing"],
  text: `Phasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", keyword: "flying" } },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: [{ act: "activate", who: "each-player", of: { type: "creature", keyword: "flying" }, only: "tap" }],
      text: STATIC_TEXT,
    },
  ],
});

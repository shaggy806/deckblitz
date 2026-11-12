import { defineCard } from "../define.js";

/** Selenia, the Cursed Heart's legendary black Aura Curse token, created
 * attached to an opponent: it doubles their life loss. */
const DOUBLE_TEXT = "If enchanted player would lose life, they lose twice that much life instead.";

export default defineCard({
  name: "Selenia's Curse Token",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${DOUBLE_TEXT}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-lose-life", who: "enchanted-player", instead: { modify: { times: 2 } } },
      text: DOUBLE_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 31943.

export default defineCard({
  name: "Root Cage",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Mercenaries don't untap during their controllers' untap steps.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Mercenary" } },
      restrictions: ["doesnt-untap"],
      text: "Mercenaries don't untap during their controllers' untap steps.",
    },
  ],
});

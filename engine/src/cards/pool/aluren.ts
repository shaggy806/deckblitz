import { defineCard } from "../define.js";

const TEXT = "Any player may cast creature spells with mana value 3 or less without paying their mana costs and as though they had flash.";

export default defineCard({
  name: "Aluren",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        anyPlayer: true,
        flash: true,
        filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
      },
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// `controlledBy: "enchanted-player"` over layers 4 and 7b: `loseCreatureTypes` and
// `setBasePt`.

const TEXT = "Nonlegendary creatures enchanted player controls have base power and toughness 3/3 and lose all creature types.";

export default defineCard({
  name: "Curse of Conformity",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "enchanted-player", notSupertype: "legendary" } },
      setBasePt: { power: 3, toughness: 3 },
      loseCreatureTypes: true,
      text: TEXT,
    },
  ],
});

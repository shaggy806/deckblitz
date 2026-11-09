import { defineCard } from "../define.js";

const CREATURES = "Creatures enchanted player controls lose all abilities and have base power and toughness 1/1.";
const LOCK = "Enchanted player can't activate abilities that aren't mana abilities or loyalty abilities.";

export default defineCard({
  name: "Overwhelming Splendor",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${CREATURES}\n${LOCK}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "enchanted-player" } },
      loseAllAbilities: true,
      setBasePt: { power: 1, toughness: 1 },
      text: CREATURES,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "activate", who: "enchanted-player", except: ["mana", "loyalty"], anyZone: true }],
      text: LOCK,
    },
  ],
});

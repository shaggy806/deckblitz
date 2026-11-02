import { defineCard } from "../define.js";

const TAX = "Enchanted creature can't attack or block unless its controller pays {3}.";
const ABILITIES = "Activated abilities of enchanted creature cost {3} more to activate.";

export default defineCard({
  name: "Oppressive Rays",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TAX}\n${ABILITIES}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      combatTax: { on: ["attack", "block"], generic: 3 },
      text: TAX,
    },
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { hostOfSource: true }, increaseGeneric: 3 },
      text: ABILITIES,
    },
  ],
});

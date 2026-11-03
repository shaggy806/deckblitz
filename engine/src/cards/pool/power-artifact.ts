import { defineCard } from "../define.js";

// Mana abilities too (rule 602.2b): Grim Monolith's {4} untap is {2}, and a cost
// of {1} or {U} stays what it is. The host's alone, whoever activates them.
const TEXT =
  "Enchanted artifact's activated abilities cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.";

export default defineCard({
  name: "Power Artifact",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${TEXT}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { hostOfSource: true }, reduceGeneric: 2, leavesOneMana: true },
      text: TEXT,
    },
  ],
});

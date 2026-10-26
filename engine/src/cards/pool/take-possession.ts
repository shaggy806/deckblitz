import { defineCard } from "../define.js";

// EDHREC rank 21236.
//
// Confiscate with split second (rule 702.61).

export default defineCard({
  name: "Take Possession",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nEnchant permanent\nYou control enchanted permanent.",
  splitSecond: true,
  targets: ["permanent"],
  controlEnchanted: true,
});

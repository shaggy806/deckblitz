import { defineCard } from "../define.js";

// EDHREC rank 25074.
// Both increases hit every player's white spells and white enchantments.

export default defineCard({
  name: "Gloom",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "White spells cost {3} more to cast.\nActivated abilities of white enchantments cost {3} more to activate.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["W"] }, increaseGeneric: 3 },
      text: "White spells cost {3} more to cast.",
    },
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { type: "enchantment", colors: ["W"] }, increaseGeneric: 3 },
      text: "Activated abilities of white enchantments cost {3} more to activate.",
    },
  ],
});

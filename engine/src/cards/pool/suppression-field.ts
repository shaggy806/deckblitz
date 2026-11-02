import { defineCard } from "../define.js";

const STATIC = "Activated abilities cost {2} more to activate unless they're mana abilities.";

// Abilities of cards in hands and graveyards too: cycling, transmute (`anyZone`).
export default defineCard({
  name: "Suppression Field",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: STATIC,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, increaseGeneric: 2, exceptManaAbilities: true, anyZone: true },
      text: STATIC,
    },
  ],
});

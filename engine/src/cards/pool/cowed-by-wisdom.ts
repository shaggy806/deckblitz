import { defineCard } from "../define.js";

const TEXT = "Enchanted creature can't attack or block unless its controller pays {1} for each card in your hand.";

// "Your" is the Aura's controller, whoever controls the creature and pays.
export default defineCard({
  name: "Cowed by Wisdom",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      combatTax: { on: ["attack", "block"], generic: "cards-in-your-hand" },
      text: TEXT,
    },
  ],
});

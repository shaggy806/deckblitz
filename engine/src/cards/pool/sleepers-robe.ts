import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 15678.

const DRAW_TEXT = "Whenever enchanted creature deals combat damage to an opponent, you may draw a card.";

// Curiosity's trigger, combat damage only; "you" and "an opponent" are the
// Aura controller's.
export default defineCard({
  name: "Sleeper's Robe",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has fear. (It can't be blocked except by artifact creatures and/or black creatures.)\n${DRAW_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["fear"],
      text: "Enchanted creature has fear.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "opponent", combat: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

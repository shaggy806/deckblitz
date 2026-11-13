import { defineCard } from "../define.js";

// EDHREC rank 11487. Dissension. Enchant opponent as Archnemesis writes it;
// "whenever enchanted opponent draws" is Curse of Fool's Wisdom's `attached`
// draw trigger. Its controller, not the enchanted player, skips their draw
// step (the ruling).
const DRAWS = "Whenever enchanted opponent draws a card, you may draw a card.";

export default defineCard({
  name: "Psychic Possession",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant opponent\nSkip your draw step.\n${DRAWS}`,
  targets: ["opponent"],
  static: [
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: "Skip your draw step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "attached" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAWS,
    },
  ],
});

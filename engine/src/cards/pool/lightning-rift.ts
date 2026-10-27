import { defineCard } from "../define.js";

// Rulings:
//   You choose the target when Lightning Rift's ability is put on the stack, but you choose
//   whether to pay the mana as the ability resolves.

const TEXT = "Whenever a player cycles a card, you may pay {1}. If you do, this enchantment deals 2 damage to any target.";

export default defineCard({
  name: "Lightning Rift",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cycles", who: "any" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have Lightning Rift deal 2 damage to the target?",
        cost: "{1}",
        effect: { kind: "damage", target: 0, amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Shadowmoor (SHM). The same X in the mana and the discard (rule 107.3a):
// `manaValueX` offers it once per X with a card to discard that it can pay for.
export default defineCard({
  name: "Knollspine Invocation",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{X}, Discard a card with mana value X: This enchantment deals X damage to any target.",
  activated: [
    {
      cost: { mana: "{X}", tap: false, discard: { count: 1, manaValueX: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "{X}, Discard a card with mana value X: This enchantment deals X damage to any target.",
    },
  ],
});

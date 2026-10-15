import { defineCard } from "../define.js";

// Lightning Axe's "discard a card or pay {N}".
export default defineCard({
  name: "Pumpkin Bombardment",
  manaCost: "{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard a card or pay {2}.\nPumpkin Bombardment deals 3 damage to target creature.",
  additionalCost: {
    options: [
      { text: "Discard a card", discard: 1 },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  targets: ["creature"],
  effect: { kind: "damage", amount: 3, target: 0 },
});

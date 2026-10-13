import { defineCard } from "../define.js";

// EDHREC rank 7043.
// A choice of whole additional costs (Eaten Alive's shape); the {5} branch is
// priced into the total cost, and the mana value stays 1 (the ruling).
export default defineCard({
  name: "Lightning Axe",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard a card or pay {5}.\nLightning Axe deals 5 damage to target creature.",
  additionalCost: {
    options: [
      { text: "Discard a card", discard: 1 },
      { text: "Pay {5}", mana: "{5}" },
    ],
  },
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});

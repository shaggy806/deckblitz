import { defineCard } from "../define.js";

// EDHREC rank 12344.
const TEXT = "Whenever this creature deals combat damage to a player, draw that many cards.";

export default defineCard({
  name: "Fear of Failed Tests",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 2,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      // "That many" — the damage dealt, which the trigger supplies.
      effect: { kind: "draw", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});

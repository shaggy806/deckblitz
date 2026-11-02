import { defineCard } from "../define.js";

export default defineCard({
  name: "Mindleech Mass",
  manaCost: "{5}{U}{B}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nWhenever this creature deals combat damage to a player, you may look at that player's hand. If you do, you may cast a spell from among those cards without paying its mana cost.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may look at that player's hand. If you do, you may cast a spell from among those cards without paying its mana cost.",
      targets: [],
      effect: {
        kind: "may",
        prompt: "Look at that player's hand?",
        effect: { kind: "cast-now", from: { handOf: "trigger-player", look: true }, free: true },
      },
    },
  ],
});

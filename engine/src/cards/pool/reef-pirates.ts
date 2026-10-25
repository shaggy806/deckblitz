import { defineCard } from "../define.js";

// Homelands. EDHREC rank 27793.
export default defineCard({
  name: "Reef Pirates",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Pirate"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature deals damage to an opponent, that player mills a card.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals damage to an opponent, that player mills a card.",
    },
  ],
});

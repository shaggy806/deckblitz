import { defineCard } from "../define.js";

// Fable of the Mirror-Breaker // Reflection of Kiki-Jiki's Goblin Shaman token.

export default defineCard({
  name: "Goblin Shaman Token",
  art: "0d9461c3-f545-4efb-926e-759961db0495",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, create a Treasure token.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "Whenever this creature attacks, create a Treasure token.",
    },
  ],
});

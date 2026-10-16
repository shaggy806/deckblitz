import { defineCard } from "../define.js";

// Extus, Oriq Overlord // Awaken the Blood Avatar's Avatar token.

export default defineCard({
  name: "Avatar Token (Awaken the Blood Avatar)",
  art: "94a50acd-ac2d-47bf-b331-0bcf5edd9c75",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 6,
  keywords: ["haste"],
  text: "Haste\nWhenever this creature attacks, it deals 3 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "each-opponent" },
      resolve: null,
      text: "Whenever this creature attacks, it deals 3 damage to each opponent.",
    },
  ],
});

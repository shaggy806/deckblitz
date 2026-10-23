import { defineCard } from "../define.js";

export default defineCard({
  name: "Call the Bloodline",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{1}, Discard a card: Create a 1/1 black Vampire Knight creature token with lifelink. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Vampire Knight Token", count: 1 },
      resolve: null,
      text: "{1}, Discard a card: Create a 1/1 black Vampire Knight creature token with lifelink. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});

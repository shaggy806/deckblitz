import { defineCard } from "../define.js";

export default defineCard({
  name: "Ayula's Influence",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Discard a land card: Create a 2/2 green Bear creature token.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: { kind: "create-token", token: "Bear Token", count: 1 },
      resolve: null,
      text: "Discard a land card: Create a 2/2 green Bear creature token.",
    },
  ],
});

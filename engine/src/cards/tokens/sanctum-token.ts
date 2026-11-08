import { defineCard } from "../define.js";

// The Sanctum land token Zagorka, Mother of Sanctum offers each player.

export default defineCard({
  name: "Sanctum Token",
  colors: [],
  types: ["land"],
  text: "{T}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});

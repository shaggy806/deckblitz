import { defineCard } from "../define.js";

// Tezzeret the Schemer's Etherium Cell token.

export default defineCard({
  name: "Etherium Cell Token",
  art: "9616ca53-ea6a-4fc1-8e01-94e0fb47e5ed",
  colors: [],
  types: ["artifact"],
  text: "{T}, Sacrifice this artifact: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Add one mana of any color.",
    },
  ],
});

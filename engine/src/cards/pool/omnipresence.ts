import { defineCard } from "../define.js";

const TEXT = "You may cast spells with mana value less than or equal to the number of creatures you control from your hand without paying their mana costs.";

export default defineCard({
  name: "Omnipresence",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        fromHand: true,
        filter: { manaValue: { op: "lte", n: { amount: { countOf: { type: "creature", controlledBy: "you" } } } } },
      },
      text: TEXT,
    },
  ],
});

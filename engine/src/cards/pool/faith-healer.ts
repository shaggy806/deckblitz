import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 18151.

const TEXT = "Sacrifice an enchantment: You gain life equal to the sacrificed enchantment's mana value.";

export default defineCard({
  name: "Faith Healer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "enchantment" } } },
      targets: [],
      effect: { kind: "gain-life", amount: { manaValueOf: "sacrificed" } },
      resolve: null,
      text: TEXT,
    },
  ],
});

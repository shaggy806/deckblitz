import { defineCard } from "../define.js";

// EDHREC rank 14753.

export default defineCard({
  name: "Omen of the Sun",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: "Flash\nWhen this enchantment enters, create two 1/1 white Human Soldier creature tokens and you gain 2 life.\n{2}{W}, Sacrifice this enchantment: Scry 2.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "{2}{W}, Sacrifice this enchantment: Scry 2.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Human Soldier Token", count: 2 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this enchantment enters, create two 1/1 white Human Soldier creature tokens and you gain 2 life.",
    },
  ],
});

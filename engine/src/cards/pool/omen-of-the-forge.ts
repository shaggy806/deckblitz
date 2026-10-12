import { defineCard } from "../define.js";

export default defineCard({
  name: "Omen of the Forge",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: "Flash\nWhen this enchantment enters, it deals 2 damage to any target.\n{2}{R}, Sacrifice this enchantment: Scry 2.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "{2}{R}, Sacrifice this enchantment: Scry 2.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this enchantment enters, it deals 2 damage to any target.",
    },
  ],
});

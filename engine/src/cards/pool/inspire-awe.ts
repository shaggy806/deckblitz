import { defineCard } from "../define.js";

// EDHREC rank 21280. Only combat damage from sources that are neither
// enchantments nor enchanted is prevented — asked of each source as its
// damage would be dealt (the ruling), not locked in as this resolves.

export default defineCard({
  name: "Inspire Awe",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn except combat damage that would be dealt by enchanted creatures and enchantment creatures. Scry 2.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-all-combat-damage", by: { notTypes: ["enchantment"], enchanted: false } },
      { kind: "scry", amount: 2 },
    ],
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Druids' Repository",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a creature you control attacks, put a charge counter on this enchantment.\nRemove a charge counter from this enchantment: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "Remove a charge counter from this enchantment: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control attacks, put a charge counter on this enchantment.",
    },
  ],
});

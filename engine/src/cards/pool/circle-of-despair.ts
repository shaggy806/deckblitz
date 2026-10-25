import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 23571.
//
// Martyr's Cause's shape with {1} added: the target is chosen as the ability
// is activated, the source as it resolves (rule 609.7a).

const TEXT =
  "{1}, Sacrifice a creature: The next time a source of your choice would deal damage to any target this turn, prevent that damage.";

export default defineCard({
  name: "Circle of Despair",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "next-time" },
      resolve: null,
      text: TEXT,
    },
  ],
});

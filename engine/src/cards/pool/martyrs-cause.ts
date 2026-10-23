import { defineCard } from "../define.js";

const TEXT =
  "Sacrifice a creature: The next time a source of your choice would deal damage to any target this turn, prevent that damage.";

// The target is chosen as the ability is activated; the source as it
// resolves (rule 609.7a — Healing Grace's shape, for the whole next event).
export default defineCard({
  name: "Martyr's Cause",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "next-time" },
      resolve: null,
      text: TEXT,
    },
  ],
});

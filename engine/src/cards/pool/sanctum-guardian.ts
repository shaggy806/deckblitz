import { defineCard } from "../define.js";

// EDHREC rank 29769. The target is chosen as the ability is activated; the
// source as it resolves (rule 609.7a — Martyr's Cause's shape).

const TEXT =
  "Sacrifice this creature: The next time a source of your choice would deal damage to any target this turn, prevent that damage.";

export default defineCard({
  name: "Sanctum Guardian",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "next-time" },
      resolve: null,
      text: TEXT,
    },
  ],
});

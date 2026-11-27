import { defineCard } from "../define.js";

// A dash cost is the alternative cost a spell cast with dash pays (rule
// 702.109a), so this changes the total cost of such a cast (601.2f) —
// Catalyst Stone's shape, `via: "dash"`. A static ability of a permanent, it
// doesn't apply to Warbringer's own dash from the hand (the reminder text).

const TEXT = "Dash costs you pay cost {2} less (as long as this creature is on the battlefield).";

export default defineCard({
  name: "Warbringer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Berserker"],
  power: 3,
  toughness: 3,
  dash: { cost: "{2}{R}" },
  text: `${TEXT}\nDash {2}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 2, when: { caster: "you", via: "dash" } },
      text: TEXT,
    },
  ],
});

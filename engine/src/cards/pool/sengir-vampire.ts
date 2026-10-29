import { defineCard } from "../define.js";

// A creature it dealt damage to this turn that dies beside it still triggers
// it (leaves-the-battlefield abilities look back, rule 603.10a), though the
// counter then has nowhere to go. Damage from an earlier stint on the
// battlefield doesn't count (rule 400.7).
const TEXT = "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Sengir Vampire",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

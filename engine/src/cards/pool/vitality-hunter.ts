import { defineCard } from "../define.js";

// EDHREC rank 21065.
//
// The becomes-monstrous trigger carries the monstrosity X as its value.

const MONSTROSITY_TEXT =
  "{X}{W}{W}: Monstrosity X. (If this creature isn't monstrous, put X +1/+1 counters on it and it becomes monstrous.)";
const COUNTER_TEXT =
  "When this creature becomes monstrous, put a lifelink counter on each of up to X target creatures.";

export default defineCard({
  name: "Vitality Hunter",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 3,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${MONSTROSITY_TEXT}\n${COUNTER_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: "x" },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});

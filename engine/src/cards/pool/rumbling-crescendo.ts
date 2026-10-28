import { defineCard } from "../define.js";

// EDHREC rank 26696.
//
// The verse counters are counted as the ability is activated, before the
// sacrifice pays its cost.

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a verse counter on this enchantment.";
const ACTIVATED_TEXT =
  "{R}, Sacrifice this enchantment: Destroy up to X target lands, where X is the number of verse counters on this enchantment.";

export default defineCard({
  name: "Rumbling Crescendo",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Rumbling Crescendo?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "any-number", of: "land", max: { countersOn: "source", counter: "verse" } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});

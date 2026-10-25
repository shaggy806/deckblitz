import { defineCard } from "../define.js";

// EDHREC rank 26122.
//
// `deals-damage` with a recipient named fires once per source per creature
// dealt damage (the ruling: several creatures, or one creature dealing damage
// to several, trigger it several times); one counter each, whatever the amount.
const TRIGGER_TEXT =
  "Whenever a creature you control deals combat damage to a creature, you may put a quest counter on this enchantment.";
const SAC_TEXT =
  "Remove a quest counter from this enchantment and sacrifice it: Put four +1/+1 counters on target creature.";

export default defineCard({
  name: "Quest for the Gemblades",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { type: "creature" }, to: "creature", combat: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Quest for the Gemblades?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 1 }, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

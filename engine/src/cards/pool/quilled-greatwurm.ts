import { defineCard } from "../define.js";

// EDHREC rank 2235. "Deals combat damage" with no recipient: once per
// simultaneous damage event for the creature's total (rule 603.2c), a trampler
// and its blocker counted together. The graveyard cast is its own permission
// (rule 113.6f) with the counters as an additional cost.
const COUNTERS_TEXT = "Whenever a creature you control deals combat damage during your turn, put that many +1/+1 counters on it. (It must survive to get the counters.)";
const CAST_TEXT = "You may cast this card from your graveyard by removing six counters from among creatures you control in addition to paying its other costs.";

export default defineCard({
  name: "Quilled Greatwurm",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${COUNTERS_TEXT}\n${CAST_TEXT}`,
  mayPlaySelf: {
    from: ["graveyard"],
    do: { kind: "remove-counters", from: { type: "creature" }, counter: "any", count: 6, among: true },
  },
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { type: "creature" }, combat: true },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});

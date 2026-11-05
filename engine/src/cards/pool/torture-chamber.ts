import { defineCard } from "../define.js";

// EDHREC rank 21921.
const UPKEEP_TEXT = "At the beginning of your upkeep, put a pain counter on this artifact.";
const END_TEXT =
  "At the beginning of your end step, this artifact deals damage to you equal to the number of pain counters on it.";
const ACT_TEXT =
  "{1}, {T}, Remove all pain counters from this artifact: It deals damage to target creature equal to the number of pain counters removed this way.";

export default defineCard({
  name: "Torture Chamber",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${END_TEXT}\n${ACT_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "pain", count: "all" } },
      targets: ["creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: ACT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "pain", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "pain" }, who: "you" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});

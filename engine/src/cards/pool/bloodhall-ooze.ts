import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 21708.
//
// Rulings: two intervening-ifs (rule 603.4), checked as each triggers and
// again as it resolves; one black-green permanent satisfies both. A
// trigger's `controls` condition counts the Ooze itself.
const BLACK_TEXT =
  "At the beginning of your upkeep, if you control a black permanent, you may put a +1/+1 counter on this creature.";
const GREEN_TEXT =
  "At the beginning of your upkeep, if you control a green permanent, you may put a +1/+1 counter on this creature.";
const COUNTER = {
  kind: "may",
  prompt: "Put a +1/+1 counter on Bloodhall Ooze?",
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
} as const;

export default defineCard({
  name: "Bloodhall Ooze",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  text: `${BLACK_TEXT}\n${GREEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { colors: ["B"] }, atLeast: 1 },
      targets: [],
      effect: COUNTER,
      resolve: null,
      text: BLACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { colors: ["G"] }, atLeast: 1 },
      targets: [],
      effect: COUNTER,
      resolve: null,
      text: GREEN_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

const ENTER = "When this creature enters from a graveyard, target opponent gains control of it.";
const UNDYING =
  "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)";

export default defineCard({
  name: "Treacherous Pit-Dweller",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 3,
  text: `${ENTER}\n${UNDYING}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { enteredFrom: "graveyard" } },
      targets: ["opponent"],
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UNDYING,
    },
  ],
});

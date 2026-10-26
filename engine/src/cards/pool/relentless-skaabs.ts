import { defineCard } from "../define.js";

// EDHREC rank 28533. The Skaabs' additional cost (`additionalCost.exileFromGraveyard`);
// undying's return isn't a cast, so it exiles nothing (the ruling).
const UNDYING =
  "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)";

export default defineCard({
  name: "Relentless Skaabs",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 4,
  text: `As an additional cost to cast this spell, exile a creature card from your graveyard.\n${UNDYING}`,
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
  triggered: [
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

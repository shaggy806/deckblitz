import { defineCard } from "../define.js";

// One ability with two trigger events. X is read as it resolves — or, gone,
// as it last existed on the battlefield.

const DRAIN_TEXT =
  "Whenever this creature enters or attacks, target opponent loses X life and you gain X life, where X is the number of +1/+1 counters on it.";
const X = { countersOn: "source", counter: "+1/+1" } as const;
const DRAIN = {
  kind: "sequence",
  effects: [
    { kind: "lose-life", amount: X, target: 0 },
    { kind: "gain-life", amount: X },
  ],
} as const;

export default defineCard({
  name: "Fell Beast of Mordor",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Drake", "Beast"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nDevour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)\n${DRAIN_TEXT}`,
  devour: { multiplier: 1, filter: { type: "creature" } },
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: ["opponent"], effect: DRAIN, resolve: null, text: DRAIN_TEXT },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: ["opponent"],
      effect: DRAIN,
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});

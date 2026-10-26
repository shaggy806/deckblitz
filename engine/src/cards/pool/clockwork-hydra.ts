import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 17815.
//
// "Remove a counter. If you do" is Noosegraf Mob's shape: the removal happens
// only while the Hydra is still here with a +1/+1 counter, and the damage only
// with it (the second ruling). An illegal target at resolution means the
// ability doesn't resolve, so no counter is removed (the first).

const TEXT =
  "Whenever this creature attacks or blocks, remove a +1/+1 counter from it. If you do, it deals 1 damage to any target.";
const PING = {
  kind: "conditional",
  condition: {
    kind: "all",
    of: [
      { kind: "source-on-battlefield" },
      { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
    ],
  },
  then: {
    kind: "sequence",
    effects: [
      { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      { kind: "damage", amount: 1, target: 0 },
    ],
  },
} as const;

export default defineCard({
  name: "Clockwork Hydra",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: "This creature enters with four +1/+1 counters on it.\nWhenever this creature attacks or blocks, remove a +1/+1 counter from it. If you do, it deals 1 damage to any target.\n{T}: Put a +1/+1 counter on this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{T}: Put a +1/+1 counter on this creature.",
    },
  ],
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: ["any-target"], effect: PING, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: ["any-target"], effect: PING, resolve: null, text: TEXT },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "This creature enters with four +1/+1 counters on it.",
    },
  ],
});

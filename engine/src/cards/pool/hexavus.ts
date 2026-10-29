import { defineCard } from "../define.js";

export default defineCard({
  name: "Hexavus",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying\nThis creature enters with six +1/+1 counters on it.\n{1}, Remove a +1/+1 counter from this creature: Put a flying counter on another target creature.\n{1}, Remove a counter from another creature you control: Put a +1/+1 counter on this creature.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from this creature: Put a flying counter on another target creature.",
    },
    {
      // A counter of any kind, from a creature you control other than this one.
      cost: {
        mana: "{1}",
        tap: false,
        removeCounter: { kind: "any", count: 1, from: { type: "creature" }, excludeSource: true },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}, Remove a counter from another creature you control: Put a +1/+1 counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 6 } },
      text: "This creature enters with six +1/+1 counters on it.",
    },
  ],
});

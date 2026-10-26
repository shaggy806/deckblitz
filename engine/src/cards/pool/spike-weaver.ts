import { defineCard } from "../define.js";

// EDHREC rank 10220. The first ability can target your own creatures (its ruling).

export default defineCard({
  name: "Spike Weaver",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spike"],
  power: 0,
  toughness: 0,
  text: "This creature enters with three +1/+1 counters on it.\n{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.\n{1}, Remove a +1/+1 counter from this creature: Prevent all combat damage that would be dealt this turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.",
    },
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "prevent-all-combat-damage" },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from this creature: Prevent all combat damage that would be dealt this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});

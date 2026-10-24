import { defineCard } from "../define.js";

// EDHREC rank 29297.

export default defineCard({
  name: "Salt Road Quartermasters",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "This creature enters with two +1/+1 counters on it.\n{2}{G}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{2}{G}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
});

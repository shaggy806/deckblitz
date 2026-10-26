import { defineCard } from "../define.js";

// EDHREC rank 26306.

export default defineCard({
  name: "Spike Drone",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spike", "Drone"],
  power: 0,
  toughness: 0,
  text: "This creature enters with a +1/+1 counter on it.\n{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});

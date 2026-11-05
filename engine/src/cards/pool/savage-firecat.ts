import { defineCard } from "../define.js";

// EDHREC rank 31029.

export default defineCard({
  name: "Savage Firecat",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: "Trample\nThis creature enters with seven +1/+1 counters on it.\nWhenever you tap a land for mana, remove a +1/+1 counter from this creature.",
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you tap a land for mana, remove a +1/+1 counter from this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 7 } },
      text: "This creature enters with seven +1/+1 counters on it.",
    },
  ],
});

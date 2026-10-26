import { defineCard } from "../define.js";

// EDHREC rank 8998.

export default defineCard({
  name: "Necropede",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 1,
  toughness: 1,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nWhen this creature dies, you may put a -1/-1 counter on target creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a -1/-1 counter on target creature?",
        effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "When this creature dies, you may put a -1/-1 counter on target creature.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 12744.

export default defineCard({
  name: "Festering Mummy",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, you may put a -1/-1 counter on target creature.",
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

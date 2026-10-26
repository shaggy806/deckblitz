import { defineCard } from "../define.js";

// EDHREC rank 12693.

export default defineCard({
  name: "Sadistic Glee",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhenever a creature dies, put a +1/+1 counter on enchanted creature.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature dies, put a +1/+1 counter on enchanted creature.",
    },
  ],
});

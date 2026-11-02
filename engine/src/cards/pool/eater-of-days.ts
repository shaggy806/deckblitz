import { defineCard } from "../define.js";

// Darksteel.
export default defineCard({
  name: "Eater of Days",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Leviathan"],
  power: 9,
  toughness: 8,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nWhen this creature enters, you skip your next two turns.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "skip-turn", who: "you", count: 2 },
      resolve: null,
      text: "When this creature enters, you skip your next two turns.",
    },
  ],
});

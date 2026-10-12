import { defineCard } from "../define.js";

export default defineCard({
  name: "Revel Ruiner",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 3,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "When this creature enters, it connives.",
    },
  ],
});

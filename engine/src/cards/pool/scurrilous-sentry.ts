import { defineCard } from "../define.js";

export default defineCard({
  name: "Scurrilous Sentry",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace\nWhenever this creature enters or attacks, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever this creature enters or attacks, it connives.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever this creature enters or attacks, it connives.",
    },
  ],
});

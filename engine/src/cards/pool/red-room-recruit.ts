import { defineCard } from "../define.js";

export default defineCard({
  name: "Red Room Recruit",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Villain"],
  power: 1,
  toughness: 2,
  text: "When this creature enters, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
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

import { defineCard } from "../define.js";

export default defineCard({
  name: "Doc Ock's Henchmen",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash\nWhenever this creature attacks, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever this creature attacks, it connives.",
    },
  ],
});

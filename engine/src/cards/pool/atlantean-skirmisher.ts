import { defineCard } from "../define.js";

export default defineCard({
  name: "Atlantean Skirmisher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 1,
  toughness: 2,
  text: "Whenever this creature attacks, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
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

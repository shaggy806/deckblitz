import { defineCard } from "../define.js";

const TEXT = "Whenever you activate an ability of a Sarkhan planeswalker, this creature deals 1 damage to any target.";

export default defineCard({
  name: "Sarkhan's Whelp",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", source: { type: "planeswalker", subtype: "Sarkhan" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});

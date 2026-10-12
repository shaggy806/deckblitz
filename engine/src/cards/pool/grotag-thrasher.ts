import { defineCard } from "../define.js";

export default defineCard({
  name: "Grotag Thrasher",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature attacks, target creature can't block this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "Whenever this creature attacks, target creature can't block this turn.",
    },
  ],
});

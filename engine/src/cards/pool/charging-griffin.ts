import { defineCard } from "../define.js";

export default defineCard({
  name: "Charging Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhenever this creature attacks, it gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +1/+1 until end of turn.",
    },
  ],
});

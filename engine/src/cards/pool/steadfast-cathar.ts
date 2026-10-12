import { defineCard } from "../define.js";

export default defineCard({
  name: "Steadfast Cathar",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, it gets +0/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +0/+2 until end of turn.",
    },
  ],
});

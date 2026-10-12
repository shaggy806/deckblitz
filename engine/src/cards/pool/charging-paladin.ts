import { defineCard } from "../define.js";

export default defineCard({
  name: "Charging Paladin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, it gets +0/+3 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +0/+3 until end of turn.",
    },
  ],
});

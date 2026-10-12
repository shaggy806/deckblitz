import { defineCard } from "../define.js";

export default defineCard({
  name: "Royal Trooper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature blocks, it gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature blocks, it gets +2/+2 until end of turn.",
    },
  ],
});

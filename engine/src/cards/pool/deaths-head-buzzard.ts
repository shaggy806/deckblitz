import { defineCard } from "../define.js";

export default defineCard({
  name: "Death's-Head Buzzard",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, all creatures get -1/-1 until end of turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature dies, all creatures get -1/-1 until end of turn.",
    },
  ],
});

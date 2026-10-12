import { defineCard } from "../define.js";

export default defineCard({
  name: "Havoc Demon",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, all creatures get -5/-5 until end of turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -5,
        toughness: -5,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature dies, all creatures get -5/-5 until end of turn.",
    },
  ],
});

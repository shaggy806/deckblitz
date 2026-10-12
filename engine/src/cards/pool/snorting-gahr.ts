import { defineCard } from "../define.js";

export default defineCard({
  name: "Snorting Gahr",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Beast"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature becomes blocked, it gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature becomes blocked, it gets +2/+2 until end of turn.",
    },
  ],
});

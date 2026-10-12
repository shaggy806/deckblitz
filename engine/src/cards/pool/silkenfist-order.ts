import { defineCard } from "../define.js";

export default defineCard({
  name: "Silkenfist Order",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 3,
  toughness: 5,
  text: "Whenever this creature becomes blocked, untap it.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever this creature becomes blocked, untap it.",
    },
  ],
});

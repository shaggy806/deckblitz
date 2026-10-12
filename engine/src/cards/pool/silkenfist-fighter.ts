import { defineCard } from "../define.js";

export default defineCard({
  name: "Silkenfist Fighter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 1,
  toughness: 3,
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

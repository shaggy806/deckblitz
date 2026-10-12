import { defineCard } from "../define.js";

export default defineCard({
  name: "Soltari Trooper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nWhenever this creature attacks, it gets +1/+1 until end of turn.",
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

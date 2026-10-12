import { defineCard } from "../define.js";

export default defineCard({
  name: "Soltari Champion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nWhenever this creature attacks, other creatures you control get +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever this creature attacks, other creatures you control get +1/+1 until end of turn.",
    },
  ],
});

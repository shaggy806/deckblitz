import { defineCard } from "../define.js";

export default defineCard({
  name: "Kinsbaile Balloonist",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, you may have target creature gain flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature gain flying until end of turn?",
        effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may have target creature gain flying until end of turn.",
    },
  ],
});

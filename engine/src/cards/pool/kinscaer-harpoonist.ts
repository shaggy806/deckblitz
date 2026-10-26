import { defineCard } from "../define.js";

// EDHREC rank 31688. The target is chosen as the trigger goes on the stack —
// a creature without flying is fine (the ruling) — and losing flying is the
// "you may" as it resolves.

export default defineCard({
  name: "Kinscaer Harpoonist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, you may have target creature lose flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature lose flying until end of turn?",
        effect: { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may have target creature lose flying until end of turn.",
    },
  ],
});

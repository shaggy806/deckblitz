import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {W}. If you do, tap target creature an opponent controls.";

// Ruling: the target is chosen as the ability triggers; whether to pay {W} is
// decided as it resolves.

export default defineCard({
  name: "Haazda Snare Squad",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Pay {W} to tap the target creature?",
        cost: "{W}",
        effect: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

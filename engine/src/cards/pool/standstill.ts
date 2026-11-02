import { defineCard } from "../define.js";

const TRIGGER =
  "When a player casts a spell, sacrifice this enchantment. If you do, each of that player's opponents draws three cards.";

// A second trigger on the stack finds it gone, and draws nothing (the ruling).
export default defineCard({
  name: "Standstill",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TRIGGER,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: { kind: "draw", amount: 3, who: "opponents-of-trigger-controller" },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});

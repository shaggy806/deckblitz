import { defineCard } from "../define.js";

// The entering creature's controller chooses the target as the ability goes on
// the stack and whether to do it as it resolves; the ability stays Death Match's
// controller's. Every creature entering, whoever's.

const TEXT = "Whenever a creature enters, that creature's controller may have target creature of their choice get -3/-3 until end of turn.";

export default defineCard({
  name: "Death Match",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targetsChosenBy: "trigger-object-controller",
      targets: ["creature"],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Have the target creature get -3/-3 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

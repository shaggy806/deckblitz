import { defineCard } from "../define.js";

// EDHREC rank 10936. The entering creature's controller chooses the target as
// the ability goes on the stack and decides as it resolves; Pandemonium's
// controller still controls the ability (the ruling). The creature is the
// source, its power read as it resolves, or as it last existed (the ruling).
const TEXT =
  "Whenever a creature enters, that creature's controller may have it deal damage equal to its power to any target of their choice.";

export default defineCard({
  name: "Pandemonium",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targetsChosenBy: "trigger-object-controller",
      targets: ["any-target"],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Have the creature deal damage equal to its power to the chosen target?",
        effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

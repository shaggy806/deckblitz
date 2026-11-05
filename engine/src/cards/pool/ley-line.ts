import { defineCard } from "../define.js";

// EDHREC rank 26289.
//
// The active player chooses the target as the ability goes on the stack and whether to put the
// counter as it resolves; the ability stays Ley Line's controller's.

const TEXT = "At the beginning of each player's upkeep, that player may put a +1/+1 counter on target creature of their choice.";

export default defineCard({
  name: "Ley Line",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: ["creature"],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Put a +1/+1 counter on the target creature?",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1, by: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

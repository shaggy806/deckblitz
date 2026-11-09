import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, flip a coin. If you lose the flip, sacrifice this enchantment.";
const CAST_TEXT = "Whenever a player casts a spell, that player flips a coin. If they lose the flip, counter that spell.";

export default defineCard({
  name: "Planar Chaos",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "flip-coin", lost: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "as-player",
        who: "trigger-controller",
        effect: { kind: "flip-coin", lost: { kind: "counter", target: "trigger-object" } },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

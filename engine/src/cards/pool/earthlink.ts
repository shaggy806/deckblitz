import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 29861.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {2}.";
const DIES_TEXT = "Whenever a creature dies, that creature's controller sacrifices a land of their choice.";

export default defineCard({
  name: "Earthlink",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-controller", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

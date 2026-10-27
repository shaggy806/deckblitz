import { defineCard } from "../define.js";

// EDHREC rank 31733.

const UPKEEP = "At the beginning of your upkeep, sacrifice this creature unless you pay {2}{B}{B}.";

export default defineCard({
  name: "Pit Raptor",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Mercenary"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{2}{B}{B}", text: "Pay {2}{B}{B}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP,
    },
  ],
});

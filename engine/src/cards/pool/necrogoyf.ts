import { defineCard } from "../define.js";

const CDA_TEXT = "Necrogoyf's power is equal to the number of creature cards in all graveyards.";
const UPKEEP_TEXT = "At the beginning of each player's upkeep, that player discards a card.";

export default defineCard({
  name: "Necrogoyf",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 4,
  madness: { cost: "{1}{B}{B}" },
  text: `${CDA_TEXT}
${UPKEEP_TEXT}
Madness {1}{B}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "discard", target: "active-player", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

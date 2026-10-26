import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 14767.
//
// Triggers at every player's end step (the ruling) — Glimmervoid's shape.

const SAC_TEXT = "At the beginning of the end step, if you control no creatures, sacrifice this land.";
const MANA_TEXT = "{T}: Add one mana of any color.";

export default defineCard({
  name: "Thran Quarry",
  colors: [],
  types: ["land"],
  text: `${SAC_TEXT}\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

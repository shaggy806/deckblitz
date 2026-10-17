import { defineCard } from "../define.js";

// EDHREC rank 11024.
// Makes Human Soldier → "Human Soldier Token".
//
// Faramir needn't have been on the battlefield when the creature died, and
// the end-step ability triggers once however many died (the rulings).

const END_TEXT = "At the beginning of your end step, if a creature died under your control this turn, draw a card.";
const TEMPT_TEXT =
  "Whenever the Ring tempts you, if you chose a creature other than Faramir as your Ring-bearer, create a 1/1 white Human Soldier creature token.";

export default defineCard({
  name: "Faramir, Field Commander",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${END_TEXT}\n${TEMPT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "died", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "ring-tempts", who: "you", chosen: "other" },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: TEMPT_TEXT,
    },
  ],
});

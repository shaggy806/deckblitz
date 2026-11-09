import { defineCard } from "../define.js";

const MIRACLE_TEXT = "Each instant and sorcery card in your hand has miracle {2}.";
const UPKEEP_TEXT = "At the beginning of each opponent's upkeep, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Lorehold, the Historian",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${MIRACLE_TEXT} (You may cast a card for its miracle cost when you draw it if it's the first card you drew this turn.)\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToHand: { filter: { typesAnyOf: ["instant", "sorcery"] }, keywordValues: [{ keyword: "miracle", cost: "{2}" }] },
      text: MIRACLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card? If you do, draw a card.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

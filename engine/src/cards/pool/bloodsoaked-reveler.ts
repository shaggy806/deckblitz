import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of your end step, if you gained life this turn, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const DRAIN_TEXT = "{4}{B}: Each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Bloodsoaked Reveler",
  art: "https://cards.scryfall.io/art_crop/back/6/8/68f71dcf-b0eb-43c7-9ea5-5ff7a7f991be.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: `${END_TEXT}\n${DRAIN_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Restless Bloodseeker", "Bloodsoaked Reveler"],
  transform: true,
});

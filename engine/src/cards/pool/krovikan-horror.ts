import { defineCard } from "../define.js";

// EDHREC rank 27459. Death Spark's "directly above" (the ruling: put there
// later, nothing in between), at the beginning of every end step, not only
// its owner's.

const RETURN_TEXT =
  "At the beginning of the end step, if this card is in your graveyard with a creature card directly above it, you may return this card to your hand.";
const PING_TEXT = "{1}, Sacrifice a creature: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Krovikan Horror",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror", "Spirit"],
  power: 2,
  toughness: 2,
  text: `${RETURN_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "all",
        of: [
          { kind: "source-zone", zones: ["graveyard"], sameObject: true },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "creature", aboveSourceInGraveyard: "directly" } },
        ],
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Krovikan Horror to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});

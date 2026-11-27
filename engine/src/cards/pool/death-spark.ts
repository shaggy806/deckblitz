import { defineCard } from "../define.js";

// EDHREC rank 25582. "Directly above" is the card put into the graveyard right
// after this one, nothing between (the ruling; rule 404.2 keeps a graveyard's
// order). Cards arriving together are arranged by their owner (404.3): this
// card's filter says it reads the order, so the game asks.

const RETURN_TEXT =
  "At the beginning of your upkeep, if this card is in your graveyard with a creature card directly above it, you may pay {1}. If you do, return this card to your hand.";

export default defineCard({
  name: "Death Spark",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Death Spark deals 1 damage to any target.\n${RETURN_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 1, target: 0 },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
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
        prompt: "Pay {1} to return Death Spark to your hand?",
        cost: "{1}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});

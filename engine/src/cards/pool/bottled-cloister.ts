import { defineCard } from "../define.js";

const EXILE_TEXT = "At the beginning of each opponent's upkeep, exile all cards from your hand face down.";
const RETURN_TEXT = "At the beginning of your upkeep, return all cards you own exiled with this artifact to your hand, then draw a card.";

export default defineCard({
  name: "Bottled Cloister",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: { kind: "exile-graveyard", target: "you", fromHand: "only", faceDown: true, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-exiled-by-source", linked: "hand", filter: { ownedBy: "you" } },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});

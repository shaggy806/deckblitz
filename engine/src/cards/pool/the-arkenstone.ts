import { defineCard } from "../define.js";

// EDHREC rank 6286.
// An adventurer card (My Precious's shape): Seek the Heart is its Adventure,
// in `seek-the-heart.ts`.

const ANTHEM_TEXT = "Creatures you control get +1/+1.";
const DRAW_TEXT = "At the beginning of your end step, draw a card.";

export default defineCard({
  name: "The Arkenstone",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ANTHEM_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  faces: ["The Arkenstone", "Seek the Heart"],
  adventure: true,
});

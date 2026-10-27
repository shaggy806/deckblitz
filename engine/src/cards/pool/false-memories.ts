import { defineCard } from "../define.js";

const DELAYED_TEXT = "At the beginning of the next end step, exile seven cards from your graveyard.";

export default defineCard({
  name: "False Memories",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Mill seven cards. ${DELAYED_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 7 },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "look-and-choose", zone: "graveyard", min: 7, max: 7, destination: "exile", leftover: "stay" },
        text: DELAYED_TEXT,
      },
    ],
  },
});

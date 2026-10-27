import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// Strixhaven (STX). EDHREC rank 17952. "You may have it gain reach" is chosen
// as the spell resolves (the ruling); learn is the rummage alone here
// (`learn()` — no sideboards).

export default defineCard({
  name: "Academic Dispute",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature blocks this turn if able. You may have it gain reach until end of turn.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "block-if-able", target: 0 },
      {
        kind: "may",
        prompt: "Have the target creature gain reach until end of turn?",
        effect: { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
      },
      learn(),
    ],
  },
});

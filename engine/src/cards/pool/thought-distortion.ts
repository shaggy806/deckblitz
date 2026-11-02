import { defineCard } from "../define.js";

// Hand and graveyard in one move. No search and no choice: every match goes.

export default defineCard({
  name: "Thought Distortion",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nTarget opponent reveals their hand. Exile all noncreature, nonland cards from that player's hand and graveyard.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      {
        kind: "exile-graveyard",
        target: 0,
        filter: { notTypes: ["creature", "land"] },
        fromHand: "also",
      },
    ],
  },
});

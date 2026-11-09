import { defineCard } from "../define.js";

// EDHREC rank 4169. Natural Selection's look and shuffle, then Foresight's draw.

export default defineCard({
  name: "Portent",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top three cards of target player's library, then put them back in any order. You may have that player shuffle.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 3,
        min: 3,
        max: 3,
        destination: "library-top",
        leftover: "stay",
      },
      {
        kind: "may",
        prompt: "Have that player shuffle?",
        effect: { kind: "shuffle-library", target: 0 },
      },
      {
        kind: "delayed-trigger",
        at: { step: "upkeep" },
        text: "Draw a card at the beginning of the next turn's upkeep.",
        effect: { kind: "draw", amount: 1 },
      },
    ],
  },
});

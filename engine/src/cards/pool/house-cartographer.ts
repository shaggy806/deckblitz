import { defineCard } from "../define.js";

// EDHREC rank 13006.
// Survival: Cynical Loner's shape — the second main phase only, and an
// intervening-if on this creature being tapped (as it last existed, if it
// has left — the rulings).
const SURVIVAL =
  "Survival — At the beginning of your second main phase, if this creature is tapped, reveal cards from the top of your library until you reveal a land card. Put that card into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "House Cartographer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout", "Survivor"],
  power: 2,
  toughness: 2,
  text: SURVIVAL,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "source", filter: { tapped: true } },
        ],
      },
      targets: [],
      effect: { kind: "reveal-until", filter: { type: "land" }, put: "hand", rest: "bottom-random" },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});

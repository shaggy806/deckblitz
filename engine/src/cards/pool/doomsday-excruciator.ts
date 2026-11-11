import { defineCard } from "../define.js";

// EDHREC rank 5410.
//
// Rulings:
//   [2024-09-20] A player with six or fewer cards remaining in their library when Doomsday
//     Excruciator's second ability resolves won't exile any cards.
const ENTER_TEXT =
  "When this creature enters, if it was cast, each player exiles all but the bottom six cards of their library face down.";
const UPKEEP_TEXT = "At the beginning of your upkeep, draw a card.";

export default defineCard({
  name: "Doomsday Excruciator",
  manaCost: "{B}{B}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true } },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-player", allBut: 6, faceDown: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

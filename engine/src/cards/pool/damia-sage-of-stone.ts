import { defineCard } from "../define.js";

// EDHREC rank 14600.
//
// Rulings:
//   [2011-09-22] The number of cards in your hand is checked at the beginning of your upkeep
//     before you have the opportunity to cast spells and activate abilities. If you have seven or
//     more cards in your hand at that time, Damia's last ability won't trigger.
//   [2011-09-22] When Damia's triggered ability tries to resolve, if you have seven or more cards
//     in your hand, it will have no effect. If you have fewer than seven cards in your hand,
//     you'll determine the difference and draw that many cards.

const SKIP_TEXT = "Skip your draw step.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if you have fewer than seven cards in hand, draw cards equal to the difference.";

export default defineCard({
  name: "Damia, Sage of Stone",
  manaCost: "{4}{B}{G}{U}",
  colors: ["B", "G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Gorgon", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${SKIP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, skipsSteps: { who: "you", steps: ["draw"] }, text: SKIP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "hand-size", atMost: 6 },
      targets: [],
      effect: { kind: "draw", amount: { difference: [7, { cardsInHand: "you" }] } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

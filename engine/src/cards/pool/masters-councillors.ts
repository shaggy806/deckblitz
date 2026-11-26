import { defineCard } from "../define.js";

// The Hobbit. EDHREC rank 21015.
//
// Rulings:
//   The triggered ability can trigger only once each turn. It doesn't matter whether Master's
//     Councillors was on the battlefield when the first card was drawn. If it's not on the
//     battlefield when the second card is drawn, the ability can't trigger at all that turn. It
//     won't trigger when the third or fourth card is drawn.

const PT_TEXT = "This creature gets +2/+0 for each graveyard with seven or more cards in it.";
const DRAW_TEXT =
  "Whenever you draw your second card each turn, target player mills three cards. (They put the top three cards of their library into their graveyard.)";

export default defineCard({
  name: "Master's Councillors",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${PT_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { players: { where: { kind: "cards-in-graveyard", atLeast: 7, whose: "that-player" } }, pt: [2, 0] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

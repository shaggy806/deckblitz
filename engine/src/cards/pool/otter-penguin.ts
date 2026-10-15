import { defineCard } from "../define.js";

// EDHREC rank 17210.
//
// Rulings:
//   [2025-10-02] If a card or ability instructs you to put cards into your hand without
//     specifically using the word "draw," it's not a card drawn.
//   [2025-10-02] Once Otter-Penguin has been blocked, its triggered ability will not cause it to
//     become unblocked.

const DRAW_TEXT =
  "Whenever you draw your second card each turn, this creature gets +1/+2 until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Otter-Penguin",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Otter", "Bird"],
  power: 2,
  toughness: 1,
  text: DRAW_TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

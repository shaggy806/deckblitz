import { defineCard } from "../define.js";

// EDHREC rank 25140.
//
// Evendo Brushrazer's shape: the permission lasts while this enchantment
// stays on the battlefield as the same object (`whileSource`), and is gated,
// every time it's used, on your having attacked this turn. Lands and spells
// alike, with their normal timing and costs. No "during your turn": the gate
// alone says when.

const EXILE_TEXT = "Whenever a creature you control that entered this turn attacks, exile the top card of your library.";
const PLAY_TEXT = "You may play cards exiled with this enchantment as long as you attacked this turn.";

export default defineCard({
  name: "Pick Up the Pace",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", enteredThisTurn: true } },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        duration: "while-source",
        whileSource: true,
        gate: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});

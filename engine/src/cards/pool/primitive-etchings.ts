import { defineCard } from "../define.js";

// Scourge. EDHREC rank 23972.
//
// "This way": the first card its controller draws in a turn, anyone's turn,
// which the static has just revealed (rule 701.20a) — its being a creature
// card is the trigger's drawn-card filter, asked as it's drawn.

const REVEAL_TEXT = "Reveal the first card you draw each turn.";
const DRAW_TEXT = "Whenever you reveal a creature card this way, draw a card.";

export default defineCard({
  name: "Primitive Etchings",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${REVEAL_TEXT} ${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      revealsFirstDrawEachTurn: "each-turn",
      text: REVEAL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 1, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

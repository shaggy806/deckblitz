import { defineCard } from "../define.js";

// EDHREC rank 20961.
//
// Each draw is asked about as it would happen (Obstinate Familiar's optional
// `would-draw`): draw it, or put a study counter on this instead.
const REPLACE = "If you would draw a card, you may put a study counter on this enchantment instead.";
const DRAW = "Remove three study counters from this enchantment, Sacrifice this enchantment: Draw seven cards.";

export default defineCard({
  name: "Pursuit of Knowledge",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${REPLACE}\n${DRAW}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          text: "put a study counter on this enchantment",
          effect: { kind: "add-counter", target: "source", counter: "study", amount: 1 },
        },
        may: true,
      },
      text: REPLACE,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "study", count: 3 }, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 7 },
      resolve: null,
      text: DRAW,
    },
  ],
});

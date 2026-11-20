import { defineCard } from "../define.js";

// EDHREC rank 16094.
//
// X is one set of colours: those among your permanents and those of the spells
// you've cast this turn — First Family itself among them, so it's at least 2
// (green and blue) as it resolves. Each spell counts with the colours it had as
// it was cast, whether or not it's still on the stack.

const X = { colorsAmong: { controlledBy: "you" }, andSpellsCastThisTurn: true } as const;

export default defineCard({
  name: "First Family",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text: "You draw X cards and gain X life, where X is the number of colors among permanents you control and spells you've cast this turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: X },
      { kind: "gain-life", amount: X },
    ],
  },
});

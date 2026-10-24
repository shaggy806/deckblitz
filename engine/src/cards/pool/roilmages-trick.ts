import { defineCard } from "../define.js";

// EDHREC rank 29471.
//
// X is read as the spell resolves; the -X/-0 lands on the creatures your
// opponents control then (rule 611.2c). Castable with no such creatures —
// you just draw (the ruling).
const CONVERGE =
  "Converge — Creatures your opponents control get -X/-0 until end of turn, where X is the number of colors of mana spent to cast this spell.";

export default defineCard({
  name: "Roilmage's Trick",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${CONVERGE}\nDraw a card.`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: { product: [{ colorsSpentOf: "source" }, -1] },
        toughness: 0,
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

import { defineCard } from "../define.js";

// Overmaster's `next` can't-be-countered grant, for creature spells.

export default defineCard({
  name: "Insist",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "The next creature spell you cast this turn can't be countered.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-spells-this-turn", next: true, filter: { type: "creature" }, cantBeCountered: true },
      { kind: "draw", amount: 1 },
    ],
  },
});

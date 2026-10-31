import { defineCard } from "../define.js";

// "The next instant or sorcery spell you cast this turn can't be countered":
// a `next` `grant-spells-this-turn` with `cantBeCountered` (rule 701.5f),
// used up by the first such spell cast after it resolves.

export default defineCard({
  name: "Overmaster",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "The next instant or sorcery spell you cast this turn can't be countered.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        cantBeCountered: true,
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

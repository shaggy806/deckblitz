import { defineCard } from "../define.js";

// EDHREC rank 12712.
//
// Rulings:
//   [2008-08-01] A hybrid creature that's blue and another color is *not* a nonblue creature.

export default defineCard({
  name: "Inundate",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return all nonblue creatures to their owners' hands.",
  targets: [],
  effect: { kind: "return-to-hand-all", filter: { type: "creature", notColors: ["U"] } },
});

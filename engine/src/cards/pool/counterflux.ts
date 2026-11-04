import { defineCard } from "../define.js";

// Overloaded it has no target, so it reaches what hexproof or protection would
// keep a target from (the ruling), and "each spell you don't control" is every
// other player's: everyone else at the table is an opponent.
export default defineCard({
  name: "Counterflux",
  manaCost: "{U}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text:
    "This spell can't be countered.\n" +
    "Counter target spell you don't control.\n" +
    "Overload {1}{U}{U}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  cantBeCountered: true,
  targets: [{ kind: "spell", whose: "opponent", filter: {} }],
  effect: { kind: "counter", target: 0 },
  overload: {
    cost: "{1}{U}{U}{R}",
    effect: { kind: "for-each-on-stack", spells: true, whose: "opponent", effect: { kind: "counter", target: 0 } },
  },
});

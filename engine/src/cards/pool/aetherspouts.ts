import { defineCard } from "../define.js";

// Magic 2015 (M15). Rulings: each owner chooses top or bottom for each of
// their attacking creatures, the active player first, then each other player
// in turn order; then they all move at once, and an owner putting two or more
// on the same end arranges them (rule 401.4).

export default defineCard({
  name: "Aetherspouts",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "For each attacking creature, its owner puts it on their choice of the top or bottom of their library.",
  effect: { kind: "put-on-libraries", what: { all: { type: "creature", attacking: true } }, position: "owner-chooses" },
});

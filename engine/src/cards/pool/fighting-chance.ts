import { defineCard } from "../define.js";

// Every blocking creature, whoever controls it, gets its own flip, one after
// another; each won prevents all the combat damage that creature would deal
// this turn.

const TEXT =
  "For each blocking creature, flip a coin. If you win the flip, prevent all combat damage that would be dealt by that creature this turn.";

export default defineCard({
  name: "Fighting Chance",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", blocking: true },
    effect: { kind: "flip-coin", won: { kind: "damage-rule", by: { target: 0 }, combat: true } },
  },
});

import { defineCard } from "../define.js";

// "X can't be 0" is `minX: 1`: the least X on offer, and no cast that pays no
// {X} (rule 107.3b: X is 0 there — its ruling). A library with fewer than X
// lands is revealed whole (its other ruling).
export default defineCard({
  name: "Mind Grind",
  manaCost: "{X}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Each opponent reveals cards from the top of their library until they reveal X land cards, then puts all cards revealed this way into their graveyard. X can't be 0.",
  minX: 1,
  effect: {
    kind: "for-each-player",
    who: "each-opponent",
    effect: {
      kind: "reveal-until-count",
      whose: "that-player",
      filter: { type: "land" },
      count: "x",
      put: "with-rest",
      rest: "graveyard",
    },
  },
});

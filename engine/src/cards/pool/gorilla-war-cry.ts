import { defineCard } from "../define.js";

// Alliances. EDHREC rank 17808.
//
// Rulings:
//   [2013-09-20] If a turn has multiple combat phases, this spell can be cast during any of them
//     as long as it's before the beginning of that phase's Declare Blockers Step.
//
// Panic's timing and delayed draw. "All creatures gain menace" reaches the
// creatures there as it resolves (rule 611.2c) — `grant-keyword-all`.

const TIMING_TEXT = "Cast this spell only during combat before blockers are declared.";

export default defineCard({
  name: "Gorilla War Cry",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TIMING_TEXT}\nAll creatures gain menace until end of turn. (They can't be blocked except by two or more creatures.)\nDraw a card at the beginning of the next turn's upkeep.`,
  castOnlyIf: { kind: "turn-structure", steps: ["begin-combat", "declare-attackers"] },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: { type: "creature" }, keyword: "menace", duration: "end-of-turn" },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});

import { defineCard } from "../define.js";

const LOSE = "At the beginning of that turn's end step, you lose the game.";

// Crimson Vow. Cleave (rule 702.148): the bracketless text drops the end step's
// loss, and only that.
export default defineCard({
  name: "Alchemist's Gambit",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Cleave {4}{U}{U}{R} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nTake an extra turn after this one. During that turn, damage can't be prevented. [${LOSE}]\nExile Alchemist's Gambit.`,
  targets: [],
  effect: {
    kind: "take-extra-turn",
    thatTurn: { damageCantBePrevented: true, atEndStep: { effect: { kind: "lose-game" }, text: LOSE } },
  },
  cleave: {
    cost: "{4}{U}{U}{R}",
    targets: [],
    effect: { kind: "take-extra-turn", thatTurn: { damageCantBePrevented: true } },
  },
  exileOnResolve: true,
});

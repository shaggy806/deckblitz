import { defineCard } from "../define.js";

// EDHREC rank 13829. The opponents' tokens are "X minus one", never below
// zero (rule 107.1b — `difference` clamps), and only yours gain menace and
// haste.

const MINE = "Create X 2/2 white Samurai creature tokens with vigilance. They gain menace and haste until end of turn.";
const THEIRS = "Each opponent creates X minus one 2/2 white Samurai creature tokens with vigilance.";

export default defineCard({
  name: "Eiganjo Uprising",
  manaCost: "{X}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: `${MINE}\n${THEIRS}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Samurai Token", count: "x", gainUntilEndOfTurn: ["menace", "haste"] },
      { kind: "create-token", token: "Samurai Token", count: { difference: ["x", 1] }, who: "each-opponent" },
    ],
  },
});

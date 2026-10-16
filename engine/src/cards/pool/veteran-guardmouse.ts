import { defineCard } from "../define.js";
import { valiant } from "../helpers.js";

// EDHREC rank 13741.
//
// Rulings:
//   [2024-07-26] If Veteran Guardmouse leaves the battlefield before its ability resolves, you’ll
//     still scry 1.

const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, it gets +1/+0 and gains first strike until end of turn. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)";

export default defineCard({
  name: "Veteran Guardmouse",
  manaCost: "{3}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 3,
  toughness: 4,
  text: VALIANT_TEXT,
  triggered: [
    valiant(
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
          // Still scries if it has left the battlefield (the ruling).
          { kind: "scry", amount: 1 },
        ],
      },
      VALIANT_TEXT,
    ),
  ],
});

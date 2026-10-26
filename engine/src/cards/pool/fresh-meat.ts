import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] Fresh Meat counts all creatures you owned that went to the graveyard this turn,
//     including creature tokens that entered under your control and nontoken creatures you owned
//     but didn't control.
//
// Asmira, Holy Avenger's count: every player's creatures that died this turn,
// narrowed to the ones you own.

export default defineCard({
  name: "Fresh Meat",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create a 3/3 green Beast creature token for each creature put into your graveyard from the battlefield this turn.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "3/3 Beast Token",
    count: { turnHistory: "died", who: "each-player", filter: { type: "creature", ownedBy: "you" } },
  },
});

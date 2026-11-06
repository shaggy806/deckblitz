import { defineCard } from "../define.js";

// Strixhaven: School of Mages (STX). EDHREC rank 1148. "You may sacrifice one
// or more creatures" is Vicious Betrayal's sacrifice of X (none at all
// included, X announced as it's cast and the creatures chosen as the cost is
// paid); "when you do, copy this spell for each creature sacrificed this way"
// is one reflexive trigger making X copies (`copyForEachSacrificed`).

export default defineCard({
  name: "Plumb the Forbidden",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may sacrifice one or more creatures. When you do, copy this spell for each creature sacrificed this way.\nYou draw a card and lose 1 life.",
  additionalCost: { sacrifice: { type: "creature" }, sacrificeCount: "x", copyForEachSacrificed: true },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "lose-life", amount: 1 },
    ],
  },
});

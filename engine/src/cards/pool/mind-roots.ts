import { defineCard } from "../define.js";

// EDHREC rank 20549.
//
// The target player chooses the two cards. "Up to one land card discarded
// this way" is a choice among the cards this spell made them discard
// (`thisWay: "discarded"`), from the graveyard they went to; one from another
// player's graveyard enters under the chooser's control (`graveyards`).
const TEXT =
  "Target player discards two cards. Put up to one land card discarded this way onto the battlefield tapped under your control.";

export default defineCard({
  name: "Mind Roots",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      {
        kind: "look-and-choose",
        zone: "graveyards",
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
        filter: { type: "land", thisWay: "discarded" },
      },
    ],
  },
});

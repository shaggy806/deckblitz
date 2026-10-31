import { defineCard } from "../define.js";

// Innistrad: Crimson Vow (VOW). EDHREC rank 5671. The draw counts every card
// you discarded this turn, for any reason, not only this discard (the
// ruling) — the turn history's `discarded` list, read after the discard.

export default defineCard({
  name: "Change of Fortune",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Discard your hand, then draw a card for each card you've discarded this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: { turnHistory: "discarded" } },
    ],
  },
});

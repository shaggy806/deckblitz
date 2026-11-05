import { defineCard } from "../define.js";

// EDHREC rank 27776. The cards go on top in the order they're picked, the first
// on top: that pick is the "any order", the caster's to make. Holding only one,
// that one goes (rule 609.3).

export default defineCard({
  name: "Agonizing Memories",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at target player's hand and choose two cards from it. Put them on top of that player's library in any order.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, lookOnly: true, picks: 2, destination: "library-top" },
});

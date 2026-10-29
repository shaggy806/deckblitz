import { defineCard } from "../define.js";

// EDHREC rank 17706.
//
// The count is your hand as this resolves (this spell is on the stack by
// then, not in it); every player sacrifices that many lands at once.

export default defineCard({
  name: "Thoughts of Ruin",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player sacrifices a land of their choice for each card in your hand.",
  targets: [],
  effect: { kind: "sacrifice", who: "each-player", filter: { type: "land" }, count: { cardsInHand: "you" } },
});

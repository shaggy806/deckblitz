import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 27986.
//
// Rulings:
//   [2004-10-04] You choose a land card that is not a basic land.
//   [2014-02-01] If you target yourself with this spell, you must reveal your entire hand to the
//     other players just as any other player would.

export default defineCard({
  name: "Encroach",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose a nonbasic land card from it. That player discards that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, filter: { type: "land", notSupertype: "basic" } },
});

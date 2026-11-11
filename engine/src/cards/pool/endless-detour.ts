import { defineCard } from "../define.js";

// Rulings:
//   The card's owner chooses whether to put it on the top or bottom of their library.
//   Endless Detour doesn't counter spells. A spell that can't be countered can still be put on
//     the top or bottom of its owner's library this way.
//   If Endless Detour targets a token, that token is put into the library, then ceases to exist.

export default defineCard({
  name: "Endless Detour",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["instant"],
  text: "The owner of target spell, nonland permanent, or card in a graveyard puts it on their choice of the top or bottom of their library.",
  targets: [{ kind: "one-of", of: ["spell", "nonland-permanent", { kind: "card-in-graveyard" }] }],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});

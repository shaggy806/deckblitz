import { defineCard } from "../define.js";

// EDHREC rank 25494.
//
// Rulings:
//   [2012-05-01] If both targets are illegal when Grave Exchange tries to resolve, it won't
//     resolve and none of its effects will happen. If only one target is legal, the effect
//     relevant to that target will happen and the other will not.
//   [2012-05-01] Grave Exchange targets both a creature card in your graveyard and a player. You
//     can't cast it unless there is a legal target to choose for both. You can target a player who
//     controls no creatures.
// The player is slot 0 because `sacrifice`'s `who: "target"` reads slot 0.
export default defineCard({
  name: "Grave Exchange",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to your hand. Target player sacrifices a creature of their choice.",
  targets: ["player", { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 1, from: "graveyard" },
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
    ],
  },
});

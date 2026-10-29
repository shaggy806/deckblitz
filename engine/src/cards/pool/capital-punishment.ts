import { defineCard } from "../define.js";

// EDHREC rank 9471.
//
// Council's dilemma: the vote, then the sacrifices (each opponent chooses in
// turn order, all sacrificed at once), then the discards (each set aside in
// turn order, all discarded at once) — the rulings' stated order.
//
// Rulings:
//   [2016-08-23] If an opponent controls fewer creatures or has fewer cards in hand than the
//     number of appropriate votes, all those creatures are sacrificed or all those cards are
//     discarded, as applicable.
//   [2016-08-23] Each opponent chooses an appropriate number of creatures to sacrifice in turn
//     order, then all of those creatures are sacrificed simultaneously. After that is complete,
//     each opponent sets aside an appropriate number of cards to discard in turn order, then all
//     cards are revealed and discarded simultaneously.
//   [2016-08-23] You must vote for one of the available options. You can't abstain.

export default defineCard({
  name: "Capital Punishment",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Council's dilemma — Starting with you, each player votes for death or taxes. Each opponent sacrifices a creature of their choice for each death vote and discards a card for each taxes vote.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["death", "taxes"] } },
      { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: { votesFor: 0 } },
      { kind: "discard", target: "each-opponent", amount: { votesFor: 1 } },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 14194.
//
// Make an Example's `each` shape: every player separates their own permanents
// — here into three piles (`pileCount: 3`, rule 700.3a), starting with the
// caster and then in turn order from them (`startingWithYou`), each seeing the
// piles made before theirs. Then one pile of each player's is picked at random
// (`atRandom`: nobody is asked; empty piles count — "Piles can be empty"), and
// every chosen pile is sacrificed in one instruction, all at once. A token
// stack's tokens are separated one by one (rule 700.3b), and an Aura may go in
// a different pile from what it enchants (the ruling).
//
// Rulings:
//   [2014-02-01] If you put all permanents you control into one pile, you'll have a two-thirds
//     chance of not having to sacrifice any permanents, but a one-third chance of having to
//     sacrifice all of them.
//   [2014-02-01] To choose a pile at random, each pile must have an equal chance of being chosen.
//   [2014-02-01] You may put Auras or Equipment into one pile and the creatures they were attached
//     to into a different pile.

export default defineCard({
  name: "Whims of the Fates",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Starting with you, each player separates all permanents they control into three piles. Then each player chooses one of their piles at random and sacrifices those permanents. (Piles can be empty.)",
  targets: [],
  effect: {
    kind: "separate-into-piles",
    objects: { permanents: {}, whose: "that-player" },
    each: "each-player",
    startingWithYou: true,
    pileCount: 3,
    atRandom: true,
    chooser: "you",
    chosen: { effect: { kind: "sacrifice-target", target: 0, byItsController: true } },
  },
});

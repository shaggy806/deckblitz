import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 14166.
//
// "For each opponent, choose up to one target creature that player controls":
// one optional slot per opponent seat (Shellshock's shape), each bound to that
// player — one that has come under anyone else's control is an illegal target
// (the ruling; rule 608.2b).
//
// "Return that creature … unless its controller has you draw a card": a
// `for-each-unless` over the target slots still legal, each creature's
// controller asked in turn order from the active player (rule 101.4 — the
// ruling's "the next opponent in turn order, or the opponent whose turn it
// is"), each knowing the answers before theirs. A slot left empty or gone
// illegal asks nobody, so that player can't have you draw (the ruling). The
// answers are held: once all are in, you draw for each "draw", then every
// creature whose controller declined goes back at once (the ruling;
// `draw`'s and `return-to-hand`'s `atRelease`).
//
// Rulings:
//   [2020-04-17] As the Decoy Gambit resolves, first the next opponent in turn order (or, if it's
//     an opponent's turn, the opponent whose turn it is) chooses whether you'll draw a card or
//     return their creature that was targeted to its owner's hand, then each other opponent in
//     turn order does so knowing the choices made before them. After all choices are made, you
//     draw the appropriate number of cards. After you've drawn, the appropriate creatures are all
//     simultaneously returned to their owners' hands.
//   [2020-04-17] If a creature targeted by Decoy Gambit changes controller, it's no longer a legal
//     target.
//   [2020-04-17] For each opponent, if you didn't choose a target creature they control or if that
//     creature has become an illegal target, that player can't choose for you to draw a card.

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Decoy Gambit",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "For each opponent, choose up to one target creature that player controls, then return that creature to its owner's hand unless its controller has you draw a card.",
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: {
    kind: "for-each-unless",
    of: { targets: [0, 1, 2] },
    asks: "controller",
    as: 3,
    options: [
      {
        doing: { kind: "draw", amount: 1, who: { controllerOf: "source" }, atRelease: true },
        text: "Have Decoy Gambit's caster draw a card (keep {it})",
      },
    ],
    otherwise: { kind: "return-to-hand", target: 3, atRelease: true },
  },
});

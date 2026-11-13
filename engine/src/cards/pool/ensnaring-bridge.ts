import { defineCard } from "../define.js";

// EDHREC rank 4943.
//
// Rulings:
//   [2004-10-04] Its effect checks the number of cards in your hand only
//     while a player (including you) is declaring attackers. Once a creature
//     has legally attacked, changing its power or the number of cards in your
//     hand won't remove it from combat.
//
// A record, not the `"cant-attack"` word: a combat record's scope is read as
// attackers are declared, outside the layer fold (`combat/rules.ts`'s
// `recordsOn`), so it can compare each creature's power with this
// artifact's controller's hand as it is then (rule 508.1c).

const TEXT = "Creatures with power greater than the number of cards in your hand can't attack.";

export default defineCard({
  name: "Ensnaring Bridge",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", power: { op: "gt", n: { amount: { cardsInHand: "you" } } } },
      },
      restrictions: [{ kind: "cant-attack" }],
      text: TEXT,
    },
  ],
});

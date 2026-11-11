import { defineCard } from "../define.js";

// EDHREC rank 5785.
//
// Rulings:
//   [2023-10-13] If you copy multiple spells with Display of Power, you can put the copies on the
//     stack in any order.
//   [2023-10-13] If you cast Display of Power, you can, at most, make one copy of each instant and
//     sorcery spell on the stack.
//   [2023-10-13] The copies will have the same targets as the spells they're copying unless you
//     choose new ones.

export default defineCard({
  name: "Display of Power",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell can't be copied.\nCopy any number of target instant and/or sorcery spells. You may choose new targets for the copies.",
  cantBeCopied: true,
  targets: [{ kind: "any-number", of: "instant-or-sorcery-spell" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "copy-spell", target: 0, newTargets: true },
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 12437.
//
// Rulings:
//   [2004-10-04] The creatures are chosen and sacrificed on resolution.
//   [2004-10-04] It deals one damage for each creature sacrificed.

export default defineCard({
  name: "Last-Ditch Effort",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Sacrifice any number of creatures. Last-Ditch Effort deals that much damage to any target.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        upTo: { countOf: { type: "creature", controlledBy: "you" } },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of creatures",
      },
      { kind: "damage", amount: { thisWay: "sacrificed" }, target: 0 },
    ],
  },
});

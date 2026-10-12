import { defineCard } from "../define.js";

// EDHREC rank 7365.
//
// Necromantic Selection's shape: the creature card is chosen as it resolves
// from those the wrath put into any graveyard (not a target — its owner's,
// opponents' included), and only when X is 6 or more (Blue Sun's Twilight's
// `x` condition).

export default defineCard({
  name: "Zero Point Ballad",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures with toughness X or less. You lose X life. If X is 6 or more, return a creature card put into a graveyard this way to the battlefield under your control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature", toughness: { op: "lte", n: "x" } } },
      { kind: "lose-life", amount: "x" },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 6 } },
        then: {
          kind: "look-and-choose",
          zone: "graveyards",
          min: 1,
          max: 1,
          destination: "battlefield",
          leftover: "stay",
          filter: { type: "creature", token: false, thisWay: "put-into-graveyard" },
        },
      },
    ],
  },
});

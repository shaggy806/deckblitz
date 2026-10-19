import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 8892.
//
// "Any number of target creatures controlled by different players" (the
// ruling: no two targets controlled by the same player) is one optional slot
// per seat a game can have — four — each another creature than the slots
// before it, controlled by none of their controllers (Protector of the
// Wastes' `differentController`). They're exiled as one event. Then each
// player who controlled a creature exiled this way (`this-way` counts an
// exiled permanent as its controller's as it left — a token too) reveals
// until a creature card, puts it onto the battlefield and the rest on the
// bottom in a random order, one player after another in turn order. A target
// that was illegal or wasn't exiled makes its controller reveal nothing.
const TEXT =
  "Exile any number of target creatures controlled by different players. For each creature exiled this way, its controller reveals cards from the top of their library until they reveal a creature card, puts that card onto the battlefield, then puts the rest on the bottom of their library in a random order.";

const slot = (before: readonly number[]): TargetSpec =>
  before.length === 0
    ? { kind: "optional", of: "creature" }
    : {
        kind: "optional",
        of: { kind: "other", of: "creature", than: { slots: before }, differentController: true },
      };

export default defineCard({
  name: "Chaos Mutation",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: TEXT,
  targets: [slot([]), slot([0]), slot([0, 1]), slot([0, 1, 2])],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0 },
          { kind: "exile", target: 1 },
          { kind: "exile", target: 2 },
          { kind: "exile", target: 3 },
        ],
      },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "conditional",
          condition: { kind: "this-way", what: "exiled", who: "that-player" },
          then: {
            kind: "reveal-until",
            whose: "that-player",
            filter: { type: "creature" },
            put: "battlefield",
            rest: "bottom-random",
          },
        },
      },
    ],
  },
});

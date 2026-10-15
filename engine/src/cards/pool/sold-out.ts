import { defineCard } from "../define.js";

// EDHREC rank 16287.
//
// "If it was dealt damage this turn" asks the creature as it last existed on
// the battlefield (rule 608.2h) — a `damagedThisTurnBy` with no clause is
// damage from any source.
export default defineCard({
  name: "Sold Out",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature. If it was dealt damage this turn, create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { damagedThisTurnBy: {} } },
        then: { kind: "create-token", token: "Clue Token", count: 1 },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 25946.
//
// "Each creature dealt damage this turn" is `damagedThisTurnBy: {}` — dealt damage by any
// source this turn (Fatal Blow's filter).

const TEXT = "Inflame deals 2 damage to each creature dealt damage this turn.";

export default defineCard({
  name: "Inflame",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature", damagedThisTurnBy: {} } },
});

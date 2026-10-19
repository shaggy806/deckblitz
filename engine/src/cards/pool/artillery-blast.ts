import { defineCard } from "../define.js";

// EDHREC rank 25956.
//
// Domain is `{ basicLandTypes: "you" }`, counted as the spell resolves.

export default defineCard({
  name: "Artillery Blast",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Domain — Artillery Blast deals X damage to target tapped creature, where X is 1 plus the number of basic land types among lands you control.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "damage", amount: { sum: [1, { basicLandTypes: "you" }] }, target: 0 },
});

import { defineCard } from "../define.js";

// EDHREC rank 15986.
//
// Rulings:
//   [2025-02-07] A permanent that is both a creature and a Vehicle is counted only once for this
//     spell's first mode.
//
// Both modes target, so a cast-time `castModal` (Abrade's shape). X counts
// permanents, each once however many of the two it is (the `anyOf`), as the
// spell resolves.

const DAMAGE_TEXT =
  "Collision Course deals X damage to target creature, where X is the number of permanents you control that are creatures and/or Vehicles.";
const DESTROY_TEXT = "Destroy target artifact.";

export default defineCard({
  name: "Collision Course",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DAMAGE_TEXT}\n• ${DESTROY_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DAMAGE_TEXT,
        targets: ["creature"],
        effect: {
          kind: "damage",
          amount: { countOf: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }], controlledBy: "you" } },
          target: 0,
        },
      },
      {
        text: DESTROY_TEXT,
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

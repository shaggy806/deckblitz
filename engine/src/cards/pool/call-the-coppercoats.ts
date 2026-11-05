import { defineCard } from "../define.js";

// EDHREC rank 1643.
//
// Officious Interrogation's shape: "those opponents" is the group's slots, one count for each, and a
// target gone illegal counts for nothing (the ruling). A table has three opponents at most.

export default defineCard({
  name: "Call the Coppercoats",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Strive — This spell costs {1}{W} more to cast for each target beyond the first.\nChoose any number of target opponents. Create X 1/1 white Human Soldier creature tokens, where X is the number of creatures those opponents control.",
  costPerExtraTarget: "{1}{W}",
  targets: [{ kind: "any-number", of: "opponent" }],
  effect: {
    kind: "create-token",
    token: "Human Soldier Token",
    count: {
      sum: [
        { countOf: { type: "creature", controlledBy: "you" }, forTarget: 0 },
        { countOf: { type: "creature", controlledBy: "you" }, forTarget: 1 },
        { countOf: { type: "creature", controlledBy: "you" }, forTarget: 2 },
      ],
    },
  },
});

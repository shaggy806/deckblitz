import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28529.
export default defineCard({
  name: "Lightning Dart",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Lightning Dart deals 1 damage to target creature. If that creature is white or blue, Lightning Dart deals 4 damage to it instead.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      ifCondition: { kind: "target", index: 0, filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }] } },
      then: 4,
      else: 1,
    },
  },
});

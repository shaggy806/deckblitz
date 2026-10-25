import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 29846. Bone Splinters' additional sacrifice.

export default defineCard({
  name: "Magma Rift",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a land.\nMagma Rift deals 5 damage to target creature.",
  additionalCost: { sacrifice: { type: "land", controlledBy: "you" } },
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});

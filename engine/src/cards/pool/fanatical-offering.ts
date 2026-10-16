import { defineCard } from "../define.js";

export default defineCard({
  name: "Fanatical Offering",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature.\nDraw two cards and create a Map token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")",
  targets: [],
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "create-token", token: "Map Token", count: 1 },
    ],
  },
});

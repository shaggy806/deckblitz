import { defineCard } from "../define.js";

// EDHREC rank 25082. Shards of Alara. One or both modes; a mode needs a legal
// target of its own (the ruling).
export default defineCard({
  name: "Branching Bolt",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Choose one or both —\n• Branching Bolt deals 3 damage to target creature with flying.\n• Branching Bolt deals 3 damage to target creature without flying.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Branching Bolt deals 3 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: "Branching Bolt deals 3 damage to target creature without flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
    ],
  },
});

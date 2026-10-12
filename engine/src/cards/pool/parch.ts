import { defineCard } from "../define.js";

export default defineCard({
  name: "Parch",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Parch deals 2 damage to any target.\n• Parch deals 4 damage to target blue creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Parch deals 2 damage to any target.",
        targets: ["any-target"],
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      {
        text: "Parch deals 4 damage to target blue creature.",
        targets: [{ kind: "permanent", filter: { colors: ["U"], type: "creature" } }],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
    ],
  },
});

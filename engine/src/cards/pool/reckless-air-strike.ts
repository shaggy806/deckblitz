import { defineCard } from "../define.js";

export default defineCard({
  name: "Reckless Air Strike",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Reckless Air Strike deals 3 damage to target creature with flying.\n• Destroy target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Reckless Air Strike deals 3 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

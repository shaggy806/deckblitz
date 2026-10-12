import { defineCard } from "../define.js";

export default defineCard({
  name: "Tangletrap",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Tangletrap deals 5 damage to target creature with flying.\n• Destroy target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Tangletrap deals 5 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

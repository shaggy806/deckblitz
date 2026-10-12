import { defineCard } from "../define.js";

export default defineCard({
  name: "Keep Out",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Keep Out deals 4 damage to target tapped creature.\n• Destroy target enchantment.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Keep Out deals 4 damage to target tapped creature.",
        targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

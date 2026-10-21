import { defineCard } from "../define.js";

export default defineCard({
  name: "Cleansing Ray",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target Vampire.\n• Destroy target enchantment.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target Vampire.",
        targets: [{ kind: "permanent", filter: { subtype: "Vampire" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

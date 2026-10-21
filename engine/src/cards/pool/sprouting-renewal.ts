import { defineCard } from "../define.js";

// EDHREC rank 17958.

export default defineCard({
  name: "Sprouting Renewal",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nChoose one —\n• Create a 2/2 green and white Elf Knight creature token with vigilance.\n• Destroy target artifact or enchantment.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Create a 2/2 green and white Elf Knight creature token with vigilance.",
        effect: { kind: "create-token", token: "Elf Knight Token", count: 1 },
      },
      {
        text: "Destroy target artifact or enchantment.",
        targets: ["artifact-or-enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

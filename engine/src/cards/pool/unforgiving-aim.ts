import { defineCard } from "../define.js";

// EDHREC rank 11464.

export default defineCard({
  name: "Unforgiving Aim",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target creature with flying.\n• Destroy target enchantment.\n• Create a 2/2 black and green Elf creature token.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Create a 2/2 black and green Elf creature token.",
        effect: { kind: "create-token", token: "2/2 Black Green Elf Token", count: 1 },
      },
    ],
  },
});

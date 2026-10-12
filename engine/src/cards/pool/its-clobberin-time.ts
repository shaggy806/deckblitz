import { defineCard } from "../define.js";

export default defineCard({
  name: "It's Clobberin' Time!",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  rebound: true,
  text:
    "Choose one —\n" +
    "• Target creature you control deals damage equal to its power to target creature an opponent controls.\n" +
    "• Destroy target artifact or enchantment.\n" +
    "Rebound",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature you control deals damage equal to its power to target creature an opponent controls.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      },
      {
        text: "Destroy target artifact or enchantment.",
        targets: ["artifact-or-enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

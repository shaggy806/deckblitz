import { defineCard } from "../define.js";

export default defineCard({
  name: "Midnight Charm",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Midnight Charm deals 1 damage to target creature and you gain 1 life.\n• Target creature gains first strike until end of turn.\n• Tap target creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Midnight Charm deals 1 damage to target creature and you gain 1 life.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [{ kind: "damage", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
        },
      },
      {
        text: "Target creature gains first strike until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      },
      {
        text: "Tap target creature.",
        targets: ["creature"],
        effect: { kind: "tap", target: 0 },
      },
    ],
  },
});

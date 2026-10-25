import { defineCard } from "../define.js";

// EDHREC rank 21880. Abrade's targeted modal shape.

export default defineCard({
  name: "Chaos Charm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target Wall.\n• Chaos Charm deals 1 damage to target creature.\n• Target creature gains haste until end of turn.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target Wall.",
        targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Chaos Charm deals 1 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      {
        text: "Target creature gains haste until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      },
    ],
  },
});

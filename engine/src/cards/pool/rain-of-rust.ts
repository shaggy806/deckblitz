import { defineCard } from "../define.js";

// EDHREC rank 29062.

export default defineCard({
  name: "Rain of Rust",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{3}{R}", keyword: "entwine" },
  text: "Choose one —\n• Destroy target artifact.\n• Destroy target land.\nEntwine {3}{R} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target land.",
        targets: ["land"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
    kickedModes: 2,
  },
});

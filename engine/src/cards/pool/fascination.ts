import { defineCard } from "../define.js";

// X is chosen as it's cast (rule 107.3a), whichever mode.

export default defineCard({
  name: "Fascination",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose one —\n• Each player draws X cards.\n• Each player mills X cards.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Each player draws X cards.",
        targets: [],
        effect: { kind: "draw", amount: "x", who: "each-player" },
      },
      {
        text: "Each player mills X cards.",
        targets: [],
        effect: { kind: "mill", target: "each-player", amount: "x" },
      },
    ],
  },
});

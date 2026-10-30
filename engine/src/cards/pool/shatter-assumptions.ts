import { defineCard } from "../define.js";

// EDHREC rank 27649.

export default defineCard({
  name: "Shatter Assumptions",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Target opponent reveals their hand and discards all colorless nonland cards.\n• Target opponent reveals their hand and discards all multicolored cards.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target opponent reveals their hand and discards all colorless nonland cards.",
        targets: ["opponent"],
        effect: { kind: "discard-hand", who: 0, filter: { colorless: true, notTypes: ["land"] }, reveal: true },
      },
      {
        text: "Target opponent reveals their hand and discards all multicolored cards.",
        targets: ["opponent"],
        effect: { kind: "discard-hand", who: 0, filter: { multicolored: true }, reveal: true },
      },
    ],
  },
});

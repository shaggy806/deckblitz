import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 31412.
export default defineCard({
  name: "Splitting Headache",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Target player discards two cards.\n• Target player reveals their hand. You choose a card from it. That player discards that card.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Target player discards two cards.", targets: ["player"], effect: { kind: "discard", target: 0, amount: 2 } },
      {
        text: "Target player reveals their hand. You choose a card from it. That player discards that card.",
        targets: ["player"],
        effect: { kind: "discard-chosen", target: 0 },
      },
    ],
  },
});

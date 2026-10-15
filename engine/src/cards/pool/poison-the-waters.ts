import { defineCard } from "../define.js";

// EDHREC rank 13167. Golgari Charm's first mode and Thoughtseize's discard.

export default defineCard({
  name: "Poison the Waters",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• All creatures get -1/-1 until end of turn.\n• Target player reveals their hand. You choose an artifact or creature card from it. That player discards that card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "All creatures get -1/-1 until end of turn.",
        effect: { kind: "modify-pt-all", filter: { type: "creature" }, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      {
        text: "Target player reveals their hand. You choose an artifact or creature card from it. That player discards that card.",
        targets: ["player"],
        effect: { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["artifact", "creature"] } },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 15380.

// "Nonland permanent card" is Solve for Disappointment's filter.
export default defineCard({
  name: "Auntie's Sentence",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Target opponent reveals their hand. You choose a nonland permanent card from it. That player discards that card.\n• Target creature gets -2/-2 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target opponent reveals their hand. You choose a nonland permanent card from it. That player discards that card.",
        targets: ["opponent"],
        effect: {
          kind: "discard-chosen",
          target: 0,
          filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"], notTypes: ["land"] },
        },
      },
      {
        text: "Target creature gets -2/-2 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
    ],
  },
});

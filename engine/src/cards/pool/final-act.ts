import { defineCard } from "../define.js";

// EDHREC 3698 (batch 315). Modes are chosen as it's cast and happen in the
// order written (rule 700.2d, its ruling). "Loses all counters" is every
// kind a player can have — energy, experience, poison, rad and the rest
// (rule 122.1, its ruling): `counter: "every-kind"`.
export default defineCard({
  name: "Final Act",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Choose one or more —\n" +
    "• Destroy all creatures.\n" +
    "• Destroy all planeswalkers.\n" +
    "• Destroy all battles.\n" +
    "• Exile all graveyards.\n" +
    "• Each opponent loses all counters.",
  castModal: {
    minModes: 1,
    maxModes: 5,
    modes: [
      { targets: [], text: "Destroy all creatures.", effect: { kind: "destroy-all", filter: { type: "creature" } } },
      {
        targets: [],
        text: "Destroy all planeswalkers.",
        effect: { kind: "destroy-all", filter: { type: "planeswalker" } },
      },
      { targets: [], text: "Destroy all battles.", effect: { kind: "destroy-all", filter: { type: "battle" } } },
      { targets: [], text: "Exile all graveyards.", effect: { kind: "exile-graveyard", target: "each-player" } },
      {
        targets: [],
        text: "Each opponent loses all counters.",
        effect: { kind: "remove-player-counters", counter: "every-kind", amount: "all", who: "each-opponent" },
      },
    ],
  },
});

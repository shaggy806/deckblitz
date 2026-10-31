import { defineCard } from "../define.js";

// The opponent the caster names chooses the mode as it's cast
// (`castModal.chosenBy`, rule 700.2e); its caster does what that mode says.
export default defineCard({
  name: "Library of Lat-Nam",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "An opponent chooses one —\n• You draw three cards at the beginning of the next turn's upkeep.\n• You search your library for a card, put that card into your hand, then shuffle.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    chosenBy: "opponent",
    modes: [
      {
        text: "You draw three cards at the beginning of the next turn's upkeep.",
        effect: {
          kind: "delayed-trigger",
          at: "next-upkeep",
          effect: { kind: "draw", amount: 3 },
          text: "Draw three cards (Library of Lat-Nam).",
        },
      },
      {
        text: "You search your library for a card, put that card into your hand, then shuffle.",
        effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      },
    ],
  },
});

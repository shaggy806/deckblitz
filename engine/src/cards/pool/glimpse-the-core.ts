import { defineCard } from "../define.js";

// EDHREC rank 6834.
//
// Live or Die's shape: a modal spell whose second mode brings its own target.
// Cave is a land type, so a "Cave card" is a land card.
const FOREST_MODE =
  "Search your library for a basic Forest card, put that card onto the battlefield tapped, then shuffle.";
const CAVE_MODE = "Return target Cave card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Glimpse the Core",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose one —\n• ${FOREST_MODE}\n• ${CAVE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: FOREST_MODE,
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", subtype: "Forest" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: 1,
        },
      },
      {
        text: CAVE_MODE,
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Cave" } }],
        effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      },
    ],
  },
});

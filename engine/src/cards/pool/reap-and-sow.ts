import { defineCard } from "../define.js";

// EDHREC rank 11882.

export default defineCard({
  name: "Reap and Sow",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{1}{G}", keyword: "entwine" },
  text: "Choose one —\n• Destroy target land.\n• Search your library for a land card, put that card onto the battlefield, then shuffle.\nEntwine {1}{G} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target land.",
        targets: ["land"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Search your library for a land card, put that card onto the battlefield, then shuffle.",
        targets: [],
        effect: { kind: "search-library", filter: { type: "land" }, destination: "battlefield", min: 0, max: 1 },
      },
    ],
    kickedModes: 2,
  },
});

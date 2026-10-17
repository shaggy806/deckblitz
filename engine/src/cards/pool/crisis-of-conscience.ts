import { defineCard } from "../define.js";

// EDHREC rank 12539.

export default defineCard({
  name: "Crisis of Conscience",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy all tokens.\n• Destroy all nonland, nontoken permanents.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy all tokens.",
        effect: { kind: "destroy-all", filter: { token: true } },
      },
      {
        text: "Destroy all nonland, nontoken permanents.",
        effect: { kind: "destroy-all", filter: { notTypes: ["land"], token: false } },
      },
    ],
  },
});

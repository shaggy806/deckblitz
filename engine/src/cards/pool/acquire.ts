import { defineCard } from "../define.js";

// EDHREC rank 10156.

export default defineCard({
  name: "Acquire",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search target opponent's library for an artifact card and put that card onto the battlefield under your control. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: { type: "artifact" },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});

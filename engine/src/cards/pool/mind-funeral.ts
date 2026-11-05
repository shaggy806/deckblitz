import { defineCard } from "../define.js";

export default defineCard({
  name: "Mind Funeral",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals cards from the top of their library until four land cards are revealed. That player puts all cards revealed this way into their graveyard.",
  targets: ["opponent"],
  effect: {
    kind: "reveal-until-count",
    whose: 0,
    filter: { type: "land" },
    count: 4,
    put: "with-rest",
    rest: "graveyard",
  },
});

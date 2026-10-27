import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 28072.

export default defineCard({
  name: "Flowstone Slide",
  manaCost: "{X}{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "All creatures get +X/-X until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: "x",
    toughness: { product: ["x", -1] },
    duration: "end-of-turn",
  },
});

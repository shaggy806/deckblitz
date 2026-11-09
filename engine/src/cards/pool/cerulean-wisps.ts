import { defineCard } from "../define.js";

// EDHREC rank 4538.

export default defineCard({
  name: "Cerulean Wisps",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature becomes blue until end of turn. Untap that creature.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become", target: 0, setColors: ["U"], duration: "end-of-turn" },
      { kind: "untap", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});

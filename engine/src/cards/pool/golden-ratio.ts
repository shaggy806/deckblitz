import { defineCard } from "../define.js";

// Each different power once, read as the spell resolves.
export default defineCard({
  name: "Golden Ratio",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Draw a card for each different power among creatures you control.",
  effect: {
    kind: "draw",
    amount: { aggregate: "distinct", of: "power", filter: { type: "creature", controlledBy: "you" } },
  },
});

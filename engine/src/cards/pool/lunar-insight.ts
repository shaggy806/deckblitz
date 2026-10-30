import { defineCard } from "../define.js";

// Each different mana value once, however many permanents share it: a
// `distinct` aggregate over the battlefield.
export default defineCard({
  name: "Lunar Insight",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw a card for each different mana value among nonland permanents you control.",
  effect: {
    kind: "draw",
    amount: {
      aggregate: "distinct",
      of: "mana-value",
      filter: { notTypes: ["land"], controlledBy: "you" },
    },
  },
});

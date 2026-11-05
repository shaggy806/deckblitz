import { defineCard } from "../define.js";

export default defineCard({
  name: "Sudden Insight",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw a card for each different mana value among nonland cards in your graveyard.",
  targets: [],
  effect: {
    kind: "draw",
    amount: { aggregate: "distinct", of: "mana-value", filter: { notTypes: ["land"], ownedBy: "you" }, in: "graveyards" },
  },
});

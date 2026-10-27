import { defineCard } from "../define.js";

// EDHREC rank 29932.

export default defineCard({
  name: "Granulate",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy each nonland artifact with mana value 4 or less.",
  targets: [],
  effect: {
    kind: "destroy-all",
    filter: { type: "artifact", notTypes: ["land"], manaValue: { op: "lte", n: 4 } },
  },
});

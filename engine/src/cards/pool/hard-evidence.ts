import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

export default defineCard({
  name: "Hard Evidence",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Create a 0/3 blue Crab creature token.\nInvestigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [{ kind: "create-token", token: "Crab Token", count: 1 }, investigate()],
  },
});

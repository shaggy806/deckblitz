import { defineCard } from "../define.js";

// Rulings: the number of Wolves is the number of Forests you control as it resolves, counting
// any land with the subtype Forest.

export default defineCard({
  name: "Howl of the Night Pack",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 2/2 green Wolf creature token for each Forest you control.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Wolf Token",
    count: { countOf: { type: "land", subtype: "Forest", controlledBy: "you" } },
  },
});

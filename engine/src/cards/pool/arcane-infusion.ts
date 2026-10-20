import { defineCard } from "../define.js";

// EDHREC rank 12363.

export default defineCard({
  name: "Arcane Infusion",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  flashback: { cost: "{3}{U}{R}" },
  text: "Look at the top four cards of your library. You may reveal an instant or sorcery card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.\nFlashback {3}{U}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["instant", "sorcery"] },
    destination: "hand",
    leftover: "bottom-random",
  },
});

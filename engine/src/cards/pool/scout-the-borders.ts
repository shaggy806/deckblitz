import { defineCard } from "../define.js";

// EDHREC rank 22162.

export default defineCard({
  name: "Scout the Borders",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top five cards of your library. You may put a creature or land card from among them into your hand. Put the rest into your graveyard.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: true,
    min: 0,
    max: 1,
    destination: "hand",
    leftover: "graveyard",
    filter: { typesAnyOf: ["creature", "land"] },
  },
});

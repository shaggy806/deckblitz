import { defineCard } from "../define.js";

// EDHREC rank 14760.

export default defineCard({
  name: "Commune with Spirits",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. You may reveal an enchantment or land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["enchantment", "land"] },
    destination: "hand",
    leftover: "bottom-random",
  },
});

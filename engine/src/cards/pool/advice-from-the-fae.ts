import { defineCard } from "../define.js";

export default defineCard({
  name: "Advice from the Fae",
  manaCost: "{2/U}{2/U}{2/U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "({2/U} can be paid with any two mana or with {U}. This card's mana value is 6.)\nLook at the top five cards of your library. If you control more creatures than each other player, put two of those cards into your hand. Otherwise, put one of them into your hand. Then put the rest on the bottom of your library in any order.",
  targets: [],
  // A tie with any one player is one card (the ruling): "more" is strict
  // against each of them.
  effect: {
    kind: "conditional",
    condition: { kind: "player-compare", stat: { controls: { type: "creature" } }, compare: "more", than: "each-opponent" },
    then: { kind: "look-and-choose", zone: "library", count: 5, min: 2, max: 2, destination: "hand", leftover: "bottom-any-order" },
    else: { kind: "look-and-choose", zone: "library", count: 5, min: 1, max: 1, destination: "hand", leftover: "bottom-any-order" },
  },
});

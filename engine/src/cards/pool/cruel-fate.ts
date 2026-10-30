import { defineCard } from "../define.js";

// EDHREC rank 30781.

export default defineCard({
  name: "Cruel Fate",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top five cards of target opponent's library. Put one of those cards into that player's graveyard and the rest on top of their library in any order.",
  targets: ["opponent"],
  effect: {
    kind: "look-and-choose",
    from: { target: 0 },
    zone: "library",
    count: 5,
    min: 1,
    max: 1,
    destination: "graveyard",
    leftover: "top-any-order",
  },
});

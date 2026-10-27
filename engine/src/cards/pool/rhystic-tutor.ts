import { defineCard } from "../define.js";

// EDHREC rank 13570. "Unless any player pays {2}": `unless` with
// `chooser: "any-player"` — each player, from the one whose turn it is in
// turn order, may pay (the ruling); the search happens only if no one does.

export default defineCard({
  name: "Rhystic Tutor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Unless any player pays {2}, search your library for a card, put that card into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "unless",
    chooser: "any-player",
    options: [{ pay: "{2}", text: "Pay {2}" }],
    otherwise: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
  },
});

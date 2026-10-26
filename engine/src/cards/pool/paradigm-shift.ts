import { defineCard } from "../define.js";

// EDHREC rank 15720. Leveler's "exile all cards from your library", then
// Survive's shuffle. Ruling: the spell is still on the stack as it resolves, so
// it isn't shuffled in with the graveyard.

export default defineCard({
  name: "Paradigm Shift",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exile all cards from your library. Then shuffle your graveyard into your library.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", whose: "you", allBut: 0 },
      { kind: "shuffle-graveyard-into-library", target: "you" },
    ],
  },
});

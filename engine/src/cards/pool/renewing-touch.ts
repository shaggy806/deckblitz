import { defineCard } from "../define.js";

// EDHREC rank 27039. Wand of Vertebrae's shuffle, any number
// of creature cards.

export default defineCard({
  name: "Renewing Touch",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Shuffle any number of target creature cards from your graveyard into your library.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-on-library", target: 0, position: "top" },
      },
      { kind: "shuffle-library" },
    ],
  },
});

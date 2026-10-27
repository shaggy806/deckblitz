import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 24613. Renewing Touch's shape, word for word.

const TEXT = "Shuffle any number of target creature cards from your graveyard into your library.";

export default defineCard({
  name: "Piper's Melody",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
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

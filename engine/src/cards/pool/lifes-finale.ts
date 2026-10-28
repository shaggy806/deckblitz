import { defineCard } from "../define.js";

// EDHREC rank 11541. The creatures are destroyed first; "up to three creature
// cards" may find fewer, even none (rule 701.23b). Into their owner's
// graveyard.

export default defineCard({
  name: "Life's Finale",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures, then search target opponent's library for up to three creature cards and put them into their graveyard. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" } },
      {
        kind: "search-library",
        whose: { target: 0 },
        filter: { type: "creature" },
        destination: "graveyard",
        min: 0,
        max: 3,
      },
    ],
  },
});

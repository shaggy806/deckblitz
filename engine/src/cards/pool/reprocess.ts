import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 9903. Sacrificing none is allowed (the
// ruling): the choice has no minimum.

const FILTER = { typesAnyOf: ["artifact", "creature", "land"], controlledBy: "you" } as const;

export default defineCard({
  name: "Reprocess",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Sacrifice any number of artifacts, creatures, and/or lands. Draw a card for each permanent sacrificed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: FILTER,
        upTo: { countOf: FILTER },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of artifacts, creatures, and/or lands",
      },
      { kind: "draw", amount: { thisWay: "sacrificed" } },
    ],
  },
});

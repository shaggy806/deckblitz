import { defineCard } from "../define.js";

// EDHREC rank 7999.
//
// "If you do" follows whichever was chosen: a branch that couldn't be done (no
// artifact, an empty hand) draws nothing, the same as declining.

export default defineCard({
  name: "Vision of Love",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may sacrifice an artifact or discard a card. If you do, draw two cards.",
  targets: [],
  effect: {
    kind: "may",
    prompt: "Sacrifice an artifact or discard a card to draw two cards?",
    effect: {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      modes: [
        {
          text: "Sacrifice an artifact.",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "sacrificed", who: "you" },
                then: { kind: "draw", amount: 2 },
              },
            ],
          },
        },
        {
          text: "Discard a card.",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 2 } },
            ],
          },
        },
      ],
    },
  },
});

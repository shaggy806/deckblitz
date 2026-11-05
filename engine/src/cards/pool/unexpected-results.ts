import { defineCard } from "../define.js";

// The revealed card is target 0 of reveal-top's `then`: a land may be put onto
// the battlefield, and only then does this spell go back to its owner's hand
// (both are one "you may"); a nonland card may be cast for free off the top.
export default defineCard({
  name: "Unexpected Results",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  text:
    "Shuffle your library, then reveal the top card. If it's a nonland card, you may cast it without paying its mana cost. If it's a land card, you may put it onto the battlefield and return Unexpected Results to its owner's hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-library" },
      {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "land" } },
          then: {
            kind: "may",
            prompt: "Put the land onto the battlefield and return Unexpected Results to your hand?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "put-onto-battlefield", target: 0 },
                { kind: "return-to-hand", target: "source", from: "stack" },
              ],
            },
          },
          else: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: {} },
            then: { kind: "cast-now", from: { libraryTop: 1 }, free: true },
          },
        },
      },
    ],
  },
});

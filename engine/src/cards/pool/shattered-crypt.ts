import { defineCard } from "../define.js";

// EDHREC rank 27772. Wildest Dreams' "X target cards", narrowed to creature
// cards, then the life loss of X.

export default defineCard({
  name: "Shattered Crypt",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return X target creature cards from your graveyard to your hand. You lose X life.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      { kind: "lose-life", amount: "x" },
    ],
  },
});

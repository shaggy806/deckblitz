import { defineCard } from "../define.js";

// Rulings:
//   Once you've cast See Double and legally chosen both modes, it doesn't matter what happens to
//     the number of cards in opponents' graveyards.
//   You may choose both modes if any opponent has eight or more cards in their graveyard, not
//     necessarily all of them.
//   The copy will have the same targets as the spell it's copying unless you choose new ones.
//
// "This spell can't be copied" is `cantBeCopied`; "you may choose both
// instead" `maxModesIf`, asked once as the modes are chosen.

export default defineCard({
  name: "See Double",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "This spell can't be copied.\n" +
    "Choose one. If an opponent has eight or more cards in their graveyard, you may choose both instead.\n" +
    "• Copy target spell. You may choose new targets for the copy. (A copy of a permanent spell becomes a token.)\n" +
    "• Create a token that's a copy of target creature.",
  cantBeCopied: true,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 }, maxModes: 2 },
    modes: [
      {
        text: "Copy target spell. You may choose new targets for the copy.",
        targets: ["spell"],
        effect: { kind: "copy-spell", target: 0, newTargets: true },
      },
      {
        text: "Create a token that's a copy of target creature.",
        targets: ["creature"],
        effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      },
    ],
  },
});

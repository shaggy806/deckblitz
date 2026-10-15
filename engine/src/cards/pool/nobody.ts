import { defineCard } from "../define.js";

// EDHREC rank 26785.
//
// Rulings:
//   You don't have to choose a target for Nobody's ability. However, if you do and the target is
//     illegal as the ability tries to resolve, it won't resolve and none of its effects will
//     happen. You won't scry.
//
// One ability: the bounce and the scry 1 together, so a chosen target gone
// illegal stops the scry too (rule 608.2b), and choosing none still scries.

const ENTER_TEXT =
  "When this creature enters, return up to one other target artifact you control to its owner's hand. Scry 1.";

export default defineCard({
  name: "Nobody",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "artifact" } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

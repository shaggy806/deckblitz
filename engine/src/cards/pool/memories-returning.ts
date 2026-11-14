import { defineCard } from "../define.js";

// EDHREC rank 9665.
//
// - The picks take turns over the five revealed cards, each a
//   `look-and-choose` of the library's top in order (rule 608.2c): a card
//   taken or bottomed leaves the rest of them on top. The opponent is chosen
//   after your first pick, as written, and makes their picks
//   (`chooser: "that-player"`).
// - With fewer than five cards the whole library was revealed, so a later
//   pick's count leaves out the card bottomed before it: the library size
//   less one, up to the cards left to pick from.

const TEXT =
  "Reveal the top five cards of your library. Put one of them into your hand. Then choose an opponent. They put one on the bottom of your library. Then you put one into your hand. Then they put one on the bottom of your library. Put the other into your hand.\nFlashback {7}{U}{U}";

const leftOfFive = (most: number) => ({ leastOf: [most, { difference: [{ librarySize: "you" }, 1] }] }) as const;

export default defineCard({
  name: "Memories Returning",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  flashback: { cost: "{7}{U}{U}" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: true,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
      },
      {
        kind: "choose-opponent",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "library",
              count: { leastOf: [4, { librarySize: "you" }] },
              chooser: "that-player",
              min: 1,
              max: 1,
              destination: "library-bottom",
              leftover: "stay",
              prompt: "Put one of them on the bottom of its owner's library",
            },
            {
              kind: "look-and-choose",
              zone: "library",
              count: leftOfFive(3),
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "stay",
            },
            {
              kind: "look-and-choose",
              zone: "library",
              count: leftOfFive(2),
              chooser: "that-player",
              min: 1,
              max: 1,
              destination: "library-bottom",
              leftover: "hand",
              prompt: "Put one of them on the bottom of its owner's library — the other goes to its owner's hand",
            },
          ],
        },
      },
    ],
  },
});

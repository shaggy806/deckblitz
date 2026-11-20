import { defineCard } from "../define.js";

// EDHREC rank 16966. Chapters I and II exile face down with a hatching
// counter (`look-and-choose`'s `withCounters` on an exile, rule 122.1: a
// counter isn't a characteristic, so the face-down card keeps it in view);
// the chooser may look at the card for as long as it stays exiled, after the
// Saga has gone too (the ruling, rule 406.3) — `faceDownLooks: "chooser"`.
// Chapter III is Azusa's Many Journeys': it comes back as Dragon-Kami's Egg.

const CHAPTER_I_II =
  "I, II — You gain 2 life. Look at the top three cards of your library. Exile one of them face down with a hatching counter on it, then put the rest on the bottom of your library in any order.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Dragon-Kami Reborn",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I_II}\n${CHAPTER_III}`,
  faces: ["The Dragon-Kami Reborn", "Dragon-Kami's Egg"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "library",
            count: 3,
            min: 1,
            max: 1,
            destination: "exile-face-down",
            faceDownLooks: "chooser",
            withCounters: [{ kind: "hatching", amount: 1 }],
            leftover: "bottom-any-order",
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});

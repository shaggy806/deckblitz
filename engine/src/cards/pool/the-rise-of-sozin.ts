import { defineCard } from "../define.js";

// EDHREC rank 6475. Front face; it transforms into Fire Lord Sozin.
//
// Rulings:
//   You target an opponent when chapter II goes on the stack, but don't name
//   a card until it resolves.
//   It has no effect on permanents with the chosen name on the battlefield.
//   You may always choose fewer than four copies.
//
// Chapter II is Ancient Vendetta's; chapter III Azusa's Many Journeys'.

const CHAPTER_I = "I — Destroy all creatures.";
const CHAPTER_II =
  "II — Choose a card name. Search target opponent's graveyard, hand, and library for up to four cards with that name and exile them. Then that player shuffles.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Rise of Sozin",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" } },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: ["opponent"],
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "search-library",
          whose: { target: 0 },
          zones: "graveyard-hand-library",
          filter: { hasName: "$chosenName" },
          destination: "exile",
          min: 0,
          max: 4,
        },
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
  faces: ["The Rise of Sozin", "Fire Lord Sozin"],
  transform: true,
});

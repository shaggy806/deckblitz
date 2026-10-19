import { defineCard } from "../define.js";

// Rulings:
//   You must search your library as the chapter II ability resolves, and you will lose 3 life.
//   As a Saga with read ahead enters the battlefield, its controller chooses a number from one to
//     that Saga's greatest chapter number. The Saga enters the battlefield with the chosen number
//     of lore counters. Neither choosing the number nor putting the counters on the Saga use the
//     stack, and neither can be responded to.
//
// Read ahead (rule 702.155): the chapters before the one picked never trigger. Chapter II's
// search is for "a card" — no stated quality — so a card must be found if the library has one
// (rule 701.19b).

const CHAPTER_I =
  "I — Target opponent reveals their hand. You choose a creature or planeswalker card from it. That player discards that card.";
const CHAPTER_II = "II — Search your library for a card, put that card into your hand, then shuffle. You lose 3 life.";
const CHAPTER_III = "III — Put target creature card from a graveyard onto the battlefield under your control.";

export default defineCard({
  name: "The Cruelty of Gix",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters don't trigger. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  readAhead: true,
  chapters: [
    {
      at: [1],
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["creature", "planeswalker"] } },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
          { kind: "lose-life", amount: 3 },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});

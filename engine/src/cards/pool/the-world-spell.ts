import { defineCard } from "../define.js";

// EDHREC rank 10393.
//
// Rulings:
//   As a Saga with read ahead enters the battlefield, its controller chooses a number from one to
//     that Saga's greatest chapter number. The Saga enters the battlefield with the chosen number
//     of lore counters. Neither choosing the number nor putting the counters on the Saga use the
//     stack, and neither can be responded to.
//
// A "non-Saga permanent card": a permanent card type (a kindred card always has
// one beside it) without the Saga subtype.
const NON_SAGA_PERMANENT = {
  typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
  notSubtypes: ["Saga"],
} as const;

const CHAPTER_I_II =
  "I, II — Look at the top seven cards of your library. You may reveal a non-Saga permanent card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const CHAPTER_III = "III — Put up to two non-Saga permanent cards from your hand onto the battlefield.";

export default defineCard({
  name: "The World Spell",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters don't trigger. Sacrifice after III.)\n" +
    `${CHAPTER_I_II}\n${CHAPTER_III}`,
  readAhead: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 7,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: NON_SAGA_PERMANENT,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 2,
        destination: "battlefield",
        leftover: "stay",
        filter: NON_SAGA_PERMANENT,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});

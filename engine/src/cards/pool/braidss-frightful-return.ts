import { defineCard } from "../define.js";

// EDHREC rank 11881.
//
// Rulings:
//   As a Saga with read ahead enters the battlefield, its controller chooses a number from one to
//     that Saga's greatest chapter number. The Saga enters the battlefield with the chosen number
//     of lore counters. Neither choosing the number nor putting the counters on the Saga use the
//     stack, and neither can be responded to.
//
// Chapter III's choice is the opponent's (`unless` with the target as chooser):
// one who can't sacrifice anything lands on "if they don't" too.
const CHAPTER_I = "I — You may sacrifice a creature. If you do, each opponent discards a card.";
const CHAPTER_II = "II — Return target creature card from your graveyard to your hand.";
const CHAPTER_III =
  "III — Target opponent may sacrifice a nonland, nontoken permanent of their choice. If they don't, they lose 2 life and you draw a card.";

export default defineCard({
  name: "Braids's Frightful Return",
  manaCost: "{2}{B}",
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
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: { kind: "discard", target: "each-opponent", amount: 1 },
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["opponent"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [
          {
            sacrifice: { notTypes: ["land"], token: false },
            text: "Sacrifice a nonland, nontoken permanent",
          },
        ],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 2, target: 0 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});

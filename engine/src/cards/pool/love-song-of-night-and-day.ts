import { defineCard } from "../define.js";

// EDHREC rank 7885.
//
// Rulings:
//   If Love Song of Night and Day's first chapter ability can't legally target an opponent, or if
//     the ability's target becomes illegal while the ability is on the stack, you don't draw any
//     cards.
//   As a Saga with read ahead enters the battlefield, its controller chooses a number from one to
//     that Saga's greatest chapter number. The Saga enters the battlefield with the chosen number
//     of lore counters. Neither choosing the number nor putting the counters on the Saga use the
//     stack, and neither can be responded to.
//
// Chapter I's opponent is its only target, so with it gone the ability doesn't
// resolve and you draw nothing either (rule 608.2b).
const CHAPTER_I = "I — You and target opponent each draw two cards.";
const CHAPTER_II = "II — Create a 1/1 white Bird creature token with flying.";
const CHAPTER_III = "III — Put a +1/+1 counter on each of up to two target creatures.";

export default defineCard({
  name: "Love Song of Night and Day",
  manaCost: "{2}{W}",
  colors: ["W"],
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
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "draw", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 1 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 9435. Read ahead (rule 702.155): its controller picks the
// starting chapter as it enters; the chapters before it never trigger.
// Chapter I's damage is one event, to the creatures and the opponents at once.

const CHAPTER_I = "I — This Saga deals 2 damage to each creature and each opponent.";
const CHAPTER_II = "II — Discard any number of cards, then draw that many cards.";
const CHAPTER_III = "III — Create a 4/4 red Dragon creature token with flying.";

export default defineCard({
  name: "The Elder Dragon War",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
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
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
          { kind: "damage", amount: 2, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true },
          { kind: "draw", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 1 },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});

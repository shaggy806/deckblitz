import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 14110.
//
// Read ahead (rule 702.155): the chapter is chosen as it enters, and the
// chapters before it never trigger. Chapter I is Sram's Expertise's free cast
// from the hand — an alternative cost, so X is 0 (the ruling) and the card is
// judged at mana value 1 or 2 that way. Chapter III is Nashi, Moon's
// Legacy's exile-and-copy: the copy is cast as the chapter resolves or not at
// all, paying its costs (the ruling), and one not cast ceases to exist.

const CHAPTER_I =
  "I — You may cast an instant or sorcery spell with mana value 1 or 2 from your hand without paying its mana cost.";
const CHAPTER_II = "II — Target player mills four cards.";
const CHAPTER_III = "III — Exile target instant or sorcery card from your graveyard. Copy it. You may cast the copy.";

export default defineCard({
  name: "Founding the Third Path",
  manaCost: "{1}{U}",
  colors: ["U"],
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
        kind: "cast-now",
        from: "hand",
        free: true,
        spell: {
          typesAnyOf: ["instant", "sorcery"],
          anyOf: [{ manaValue: { op: "eq", n: 1 } }, { manaValue: { op: "eq", n: 2 } }],
        },
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 4 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});

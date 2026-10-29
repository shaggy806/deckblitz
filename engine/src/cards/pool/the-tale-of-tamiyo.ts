import { defineCard } from "../define.js";

// EDHREC rank 12651.
//
// Chapters I–III: each pass mills two and, if the pair shares a card type,
// draws and goes again — until a pass mills two that share none, or one or
// fewer (the ruling). Chapter IV exiles the targets at once and offers a
// copy of each to cast now, paying its costs (Founding the Third Path's
// shape, several cards as Mizzix's Mastery overloaded); a copy of a Tamiyo
// card becomes a token as it resolves, and one not cast ceases to exist.

const LOOP_TEXT =
  "I, II, III — Mill two cards. If two cards that share a card type were milled this way, draw a card and repeat this process.";
const FINAL_TEXT =
  "IV — Exile any number of target instant, sorcery, and/or Tamiyo planeswalker cards from your graveyard. Copy them. You may cast any number of the copies.";

const PAIR = { kind: "this-way", what: "milled", sharing: "card-type", atLeast: 2 } as const;

export default defineCard({
  name: "The Tale of Tamiyo",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${LOOP_TEXT}\n${FINAL_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "repeat",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: "you", amount: 2 },
            { kind: "conditional", condition: PAIR, then: { kind: "draw", amount: 1 } },
          ],
        },
        again: PAIR,
      },
      resolve: null,
      text: LOOP_TEXT,
    },
    {
      at: [4],
      targets: [
        {
          kind: "any-number",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { type: "planeswalker", subtype: "Tamiyo" }] },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
          { kind: "cast-now", from: "exiled-this-way", copies: 1 },
        ],
      },
      resolve: null,
      text: FINAL_TEXT,
    },
  ],
});

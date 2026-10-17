import { defineCard } from "../define.js";

// EDHREC rank 9382.
// Makes Beast → "3/3 Beast Token".

const I_TEXT = "I — Create a 3/3 green Beast creature token.";
const II_TEXT =
  "II — You may sacrifice a creature. If you do, search your library for a creature or basic land card, reveal it, put it into your hand, then shuffle.";
const III_TEXT = "III — Up to two target creatures each get +2/+2 and gain trample until end of turn.";

export default defineCard({
  name: "The Huntsman's Redemption",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "3/3 Beast Token", count: 1 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "search-library",
          filter: { anyOf: [{ type: "creature" }, { type: "land", supertype: "basic" }] },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: II_TEXT,
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
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 1, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});

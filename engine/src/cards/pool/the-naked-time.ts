import { defineCard } from "../define.js";

// EDHREC rank 32107.

const I_TEXT = "I — Search your library for a basic Mountain card, put it onto the battlefield tapped, then shuffle.";
const II_TEXT =
  "II — Whenever a creature you control enters this turn, put a +1/+1 counter on it and it gains haste until end of turn.";
const III_TEXT = "III — Sacrifice a land.";

export default defineCard({
  name: "The Naked Time",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land", subtype: "Mountain" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } } },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
          ],
        },
        text: "Whenever a creature you control enters this turn, put a +1/+1 counter on it and it gains haste until end of turn.",
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: III_TEXT,
    },
  ],
});

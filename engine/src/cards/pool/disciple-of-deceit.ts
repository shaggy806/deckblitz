import { defineCard } from "../define.js";

// EDHREC rank 17498.
//
// A discarded {X} card and a searched-for one both count X as 0 (the ruling),
// and a split card its combined cost: both are its mana value in those zones.

const TEXT =
  "Inspired — Whenever this creature becomes untapped, you may discard a nonland card. If you do, search your library for a card with the same mana value as that card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Disciple of Deceit",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a nonland card to search your library for a card with the same mana value?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1, filter: { notTypes: ["land"] } },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "search-library",
                filter: { manaValue: { op: "eq", n: { amount: { thisWay: "discarded", sumOf: "mana-value" } } } },
                destination: "hand",
                reveal: true,
                min: 0,
                max: 1,
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

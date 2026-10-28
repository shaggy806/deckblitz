import { defineCard } from "../define.js";

// EDHREC rank 8646. Its enters ability reads the X Orcus was cast with (rule
// 107.3m): a modal triggered ability whose second mode is a group of up to X
// targets with total mana value X or less, both read as it goes on the stack.
// Bond of Revival's "it gains haste" after the return, for each.
//
// Rulings:
//   [2021-07-23] You may cast Orcus, Prince of Undeath with X equal to 0. If you do, the triggered
//     ability will do nothing as it resolves.
const RETURN_TEXT =
  "Return up to X target creature cards with total mana value X or less from your graveyard to the battlefield. They gain haste until end of turn.";

export default defineCard({
  name: "Orcus, Prince of Undeath",
  manaCost: "{X}{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 3,
  keywords: ["flying", "trample"],
  text: `Flying, trample\nWhen Orcus enters, choose one —\n• Each other creature gets -X/-X until end of turn. You lose X life.\n• ${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Each other creature gets -X/-X until end of turn. You lose X life.",
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "modify-pt-all",
                  filter: { type: "creature" },
                  power: { product: ["x", -1] },
                  toughness: { product: ["x", -1] },
                  duration: "end-of-turn",
                  exceptSource: true,
                },
                { kind: "lose-life", amount: "x" },
              ],
            },
          },
          {
            text: RETURN_TEXT,
            targets: [
              {
                kind: "any-number",
                of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
                max: "x",
                maxTotalManaValue: "x",
              },
            ],
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "for-each-target",
                  from: 0,
                  simultaneous: true,
                  effect: { kind: "put-onto-battlefield", target: 0 },
                },
                {
                  kind: "for-each-target",
                  from: 0,
                  effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `When Orcus enters, choose one —\n• Each other creature gets -X/-X until end of turn. You lose X life.\n• ${RETURN_TEXT}`,
    },
  ],
});

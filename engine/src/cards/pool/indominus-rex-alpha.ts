import { defineCard } from "../define.js";

// EDHREC rank 10437. Jurassic World Collection. Top-500 commander #294.
//
// Rulings:
//   If Indominus Rex isn't on the battlefield as its last ability resolves, use the number of
//     counters that were on it when it was last on the battlefield to determine how many cards to
//     draw.
//   Indominus Rex's first ability will give it only one of each kind of counter, even if you
//     discard more than one creature card with the relevant ability.
//   If you put counters on Indominus Rex before its last ability resolves, those counters will
//     count.
//
// The discard is `AsEntersAction.discard` (part of the replacement, rule 614.1c),
// one keyword counter of each listed keyword among the discarded cards; the
// draw counts every counter on it (`countersOn` with no kind), read from its
// last-known state if it's gone (the first ruling).
const ENTER_TEXT =
  "As Indominus Rex enters, discard any number of creature cards. It enters with a flying counter on it if a card discarded this way has flying. The same is true for first strike, double strike, deathtouch, hexproof, haste, indestructible, lifelink, menace, reach, trample, and vigilance.";
const DRAW_TEXT = "When Indominus Rex enters, draw a card for each counter on it.";

export default defineCard({
  name: "Indominus Rex, Alpha",
  manaCost: "{1}{U/B}{U/B}{G}{G}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dinosaur", "Mutant"],
  power: 6,
  toughness: 6,
  text: `${ENTER_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: {
          discard: {
            filter: { type: "creature" },
            keywordCounters: [
              "flying",
              "first-strike",
              "double-strike",
              "deathtouch",
              "hexproof",
              "haste",
              "indestructible",
              "lifelink",
              "menace",
              "reach",
              "trample",
              "vigilance",
            ],
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source" } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 14379. Commander Legends: Battle for Baldur's Gate.
//
// The search finds and reveals the lands and leaves them where they are
// (`destination: "stay"`, `shufflesLater`); its `then` — applied whatever was
// found (`thenAlways`), the finds as its targets — rolls the d20, each row
// moving those cards from the library: into your hand together, one of your
// choice onto the battlefield tapped and the other into your hand (a
// `look-and-choose` among the targets, one card alone going onto the
// battlefield), or both onto the battlefield tapped together. "Then shuffle"
// follows every row: the `shuffle-library` of `searchers` the search owes.

const ENTERS_TEXT =
  "When this creature enters, search your library for up to two basic land cards and reveal them, then roll a d20.";
const ROWS_TEXT =
  "9 or less | Put those cards into your hand, then shuffle.\n10—19 | Put one of those cards onto the battlefield tapped and the other into your hand, then shuffle.\n20+ | Put those cards onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Druid of the Emerald Grove",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dwarf", "Druid"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${ROWS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "stay",
        min: 0,
        max: 2,
        reveal: true,
        shufflesLater: true,
        thenAlways: true,
        then: {
          kind: "roll-dice",
          sides: 20,
          table: [
            {
              min: -1000000,
              max: 9,
              effect: {
                kind: "for-each-target",
                from: 0,
                simultaneous: true,
                effect: { kind: "return-to-hand", target: 0, from: "library" },
              },
            },
            {
              min: 10,
              max: 19,
              effect: {
                kind: "look-and-choose",
                zone: "targets",
                min: 1,
                max: 1,
                destination: "battlefield",
                enterTapped: true,
                leftover: "hand",
              },
            },
            {
              min: 20,
              effect: {
                kind: "for-each-target",
                from: 0,
                simultaneous: true,
                effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
              },
            },
          ],
          then: { kind: "shuffle-library", searchers: true },
        },
      },
      resolve: null,
      text: `${ENTERS_TEXT}\n${ROWS_TEXT}`,
    },
  ],
});

import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 31743.
//
// Rulings:
//   It needn't be cast (or be red) for the check to work: put onto the battlefield some other
//   way, it still asks whether you've cast a red spell this turn. The check is made as it
//   enters.
//
// "Another red spell": the red spells you cast this turn, less this one if you cast it —
// two or more if it entered as a spell you cast (its own cast is in the list), one or more
// otherwise. Patched Plaything's conditional enters-with-counters amount.

export default defineCard({
  name: "Hotheaded Giant",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste\nThis creature enters with two -1/-1 counters on it unless you've cast another red spell this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "-1/-1",
          amount: {
            ifCondition: {
              kind: "any",
              of: [
                {
                  kind: "all",
                  of: [
                    { kind: "source", filter: { cast: true, castBy: "you" } },
                    { kind: "cast-this-turn", who: "you", filter: { colors: ["R"] }, atLeast: 2 },
                  ],
                },
                {
                  kind: "all",
                  of: [
                    { kind: "not", of: { kind: "source", filter: { cast: true, castBy: "you" } } },
                    { kind: "cast-this-turn", who: "you", filter: { colors: ["R"] }, atLeast: 1 },
                  ],
                },
              ],
            },
            then: 0,
            else: 2,
          },
        },
      },
      text: "This creature enters with two -1/-1 counters on it unless you've cast another red spell this turn.",
    },
  ],
});

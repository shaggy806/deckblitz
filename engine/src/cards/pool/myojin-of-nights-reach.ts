import { defineCard } from "../define.js";

// EDHREC rank 11794.
//
// Rulings:
//   [2024-11-08] In a Commander game where this card is your commander, casting it from the
//     command zone does not count as casting it from your hand.

const ENTER_TEXT = "Myojin of Night's Reach enters with a divinity counter on it if you cast it from your hand.";
const INDESTRUCTIBLE_TEXT = "Myojin of Night's Reach has indestructible as long as it has a divinity counter on it.";
const DISCARD_TEXT = "Remove a divinity counter from Myojin of Night's Reach: Each opponent discards their hand.";

export default defineCard({
  name: "Myojin of Night's Reach",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 2,
  text: `${ENTER_TEXT}\n${INDESTRUCTIBLE_TEXT}\n${DISCARD_TEXT}`,
  static: [
    {
      // Myojin of Blooming Dawn's cast-from-hand counter.
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "divinity",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
    {
      // Manor Gargoyle's conditional keyword, Kindred Boon's counter filter.
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "divinity", compare: { op: "gte", n: 1 } } } },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "divinity", count: 1 } },
      targets: [],
      effect: { kind: "discard-hand", who: "each-opponent" },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 11284.
//
// Rulings:
//   [2013-07-01] In a Commander game where this card is your commander, casting it from the
//     Command zone does not count as casting it from your hand.
// The enters-with-counter is Myojin of Blooming Dawn's cast-from-hand
// replacement; the put-onto-battlefield is Ghalta, Stampede Tyrant's.

const ENTER_TEXT = "Myojin of Life's Web enters with a divinity counter on it if you cast it from your hand.";
const INDESTRUCTIBLE_TEXT = "Myojin of Life's Web has indestructible as long as it has a divinity counter on it.";
const PUT_TEXT =
  "Remove a divinity counter from Myojin of Life's Web: Put any number of creature cards from your hand onto the battlefield.";

export default defineCard({
  name: "Myojin of Life's Web",
  manaCost: "{6}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 8,
  toughness: 8,
  text: `${ENTER_TEXT}\n${INDESTRUCTIBLE_TEXT}\n${PUT_TEXT}`,
  static: [
    {
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
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 99,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
      },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
});

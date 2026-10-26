import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 12740.
//
// Rulings:
//   [2013-07-01] In a Commander game where this card is your commander, casting it from the
//     Command zone does not count as casting it from your hand.
//
// Myojin of Blooming Dawn's cast-from-hand counter (a divinity counter here),
// and Kindred Boon's divinity-counter filter on the Myojin itself. "For each
// permanent you control" is counted as the ability resolves.

const ENTER_TEXT = "Myojin of Seeing Winds enters with a divinity counter on it if you cast it from your hand.";
const INDESTRUCTIBLE_TEXT = "Myojin of Seeing Winds has indestructible as long as it has a divinity counter on it.";
const DRAW_TEXT = "Remove a divinity counter from Myojin of Seeing Winds: Draw a card for each permanent you control.";

export default defineCard({
  name: "Myojin of Seeing Winds",
  manaCost: "{7}{U}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${INDESTRUCTIBLE_TEXT}\n${DRAW_TEXT}`,
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
      effect: { kind: "draw", amount: { countOf: { controlledBy: "you" } } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 10159.
//
// The enters-with-counter is Patched Plaything's cast-from-hand replacement.
// "For each permanent you control" is counted as the ability resolves (rule
// 608.2h), the Myojin itself included.
const ENTER_TEXT =
  "Myojin of Blooming Dawn enters with an indestructible counter on it if you cast it from your hand.";
const TOKEN_TEXT =
  "Remove an indestructible counter from Myojin of Blooming Dawn: Create a 1/1 colorless Spirit creature token for each permanent you control.";

export default defineCard({
  name: "Myojin of Blooming Dawn",
  manaCost: "{5}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 6,
  text: `${ENTER_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "indestructible",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "indestructible", count: 1 } },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Spirit Token (Colorless)",
        count: { countOf: { controlledBy: "you" } },
      },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});

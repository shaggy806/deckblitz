import { defineCard } from "../define.js";

const ENTER_TEXT = "Myojin of Grim Betrayal enters with an indestructible counter on it if you cast it from your hand.";
const RETURN_TEXT =
  "Remove an indestructible counter from Myojin of Grim Betrayal: Put onto the battlefield under your control all creature cards in all graveyards that were put there from anywhere this turn.";

export default defineCard({
  name: "Myojin of Grim Betrayal",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 2,
  text: `${ENTER_TEXT}\n${RETURN_TEXT}`,
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
        kind: "return-from-graveyard",
        from: "all-graveyards",
        filter: { type: "creature", putIntoGraveyardThisTurn: {} },
        destination: "battlefield",
        count: "all",
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});

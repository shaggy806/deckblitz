import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Myojin of Night's Reach and Grim Betrayal enters the battlefield with an indestructible counter on it if you cast it from your hand.";
const ABILITY_TEXT =
  "Remove an indestructible counter from Myojin of Night's Reach and Grim Betrayal: Each opponent discards their hand. Put onto the battlefield under your control all creature cards in all graveyards that were put there from anywhere this turn.";

export default defineCard({
  name: "Myojin of Night's Reach and Grim Betrayal",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 10,
  toughness: 4,
  text: `${ENTER_TEXT}\n${ABILITY_TEXT}`,
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
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "each-opponent" },
          {
            kind: "return-from-graveyard",
            from: "all-graveyards",
            filter: { type: "creature", putIntoGraveyardThisTurn: {} },
            destination: "battlefield",
            count: "all",
          },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});

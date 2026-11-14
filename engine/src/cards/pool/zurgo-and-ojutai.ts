import { defineCard } from "../define.js";

// EDHREC rank 9241.
//
// Rulings:
//   [2023-04-14] The triggered ability triggers once for each player or battle dealt combat
//     damage by Dragons you control, however many Dragons were involved (`orBattle`, batched).
//   [2023-04-14] Returning one of the Dragons is chosen as the ability resolves; it doesn't
//     target (a `choose-permanents` among the trigger's batch).

export default defineCard({
  name: "Zurgo and Ojutai",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: "Flying, haste\nZurgo and Ojutai has hexproof as long as it entered this turn.\nWhenever one or more Dragons you control deal combat damage to a player or battle, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. You may return one of those Dragons to its owner's hand.",
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { subtype: "Dragon" },
        combat: true,
        orBattle: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 3,
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "bottom-any-order",
          },
          {
            kind: "choose-permanents",
            filter: { inSet: "trigger-batch" },
            upTo: 1,
            min: 0,
            prompt: "You may return one of those Dragons to its owner's hand.",
            then: { kind: "return-to-hand", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "Whenever one or more Dragons you control deal combat damage to a player or battle, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. You may return one of those Dragons to its owner's hand.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["hexproof"],
      text: "Zurgo and Ojutai has hexproof as long as it entered this turn.",
      condition: { kind: "source", filter: { enteredThisTurn: true } },
    },
  ],
});

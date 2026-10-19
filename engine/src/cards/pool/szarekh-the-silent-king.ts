import { defineCard } from "../define.js";

// EDHREC rank 10153.
//
// T'Chaka, Venerable King's shape: mill, then an optional pick from the cards
// this resolution milled. "An artifact creature card or Vehicle card" is an
// `anyOf` of both types together or the Vehicle subtype.

const ATTACK_TEXT =
  "My Will Be Done — Whenever Szarekh attacks, mill three cards. You may put an artifact creature card or Vehicle card from among the cards milled this way into your hand.";

export default defineCard({
  name: "Szarekh, the Silent King",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: {
              thisWay: "milled",
              anyOf: [{ types: ["artifact", "creature"] }, { subtype: "Vehicle" }],
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

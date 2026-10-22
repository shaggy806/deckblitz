import { defineCard } from "../define.js";

// Rulings:
//   The life gained from the −2 is the creature's power as it last existed on
//     the battlefield (Swords to Plowshares' shape reads it that way).
//   A nonland permanent card is an artifact, creature, enchantment, or
//     planeswalker card (and a battle card since battles exist).
const PLUS = "+2: Reveal the top three cards of your library. Put all nonland permanent cards revealed this way into your hand and the rest on the bottom of your library in any order.";
const MINUS = "−2: Exile target creature. Its controller gains life equal to its power.";
const ULT = "−9: Put five +1/+1 counters on each creature you control and five loyalty counters on each other planeswalker you control.";

export default defineCard({
  name: "Ajani Unyielding",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: true,
        min: 3,
        max: 3,
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"] },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "gain-life", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 5 },
          {
            kind: "add-counter-all",
            filter: { type: "planeswalker", controlledBy: "you" },
            counter: "loyalty",
            amount: 5,
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});

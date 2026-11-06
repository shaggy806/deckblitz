import { defineCard } from "../define.js";

// Mystery Booster Commander. The −3 is Gleam of Death's "put all … from among
// them into your hand"; the −8 sets the base P/T of the creatures you control
// as it resolves (rule 611.2c), and they gain trample.
const PLUS =
  "+2: Create a Giant Badger token. (It's a {1}{G}{G} 2/2 Badger creature with \"Whenever this token blocks, it gets +2/+2 until end of turn.\")";
const MINUS_THREE = "−3: Mill three cards. Put all permanent cards from among them into your hand.";
const MINUS_EIGHT = "−8: Until end of turn, creatures you control have base power and toughness 8/8 and gain trample.";

export default defineCard({
  name: "Greensleeves",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Greensleeves"],
  loyalty: 5,
  canBeCommander: true,
  text: `${PLUS}\n${MINUS_THREE}\n${MINUS_EIGHT}\nGreensleeves can be your commander.`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Giant Badger Token", count: 1 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 3,
            max: 3,
            destination: "hand",
            leftover: "stay",
            filter: {
              thisWay: "milled",
              typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            },
          },
        ],
      },
      resolve: null,
      text: MINUS_THREE,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 8,
        toughness: 8,
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: MINUS_EIGHT,
    },
  ],
});

import { defineCard } from "../define.js";

// Mystery Booster Commander.
const PLUS = "+2: Create two 1/1 blue Bird creature tokens with flying.";
const ZERO = "0: Draw a card. You may put a permanent card with mana value 4 or less from your hand onto the battlefield.";
const MINUS = "−7: Create a Feroz's Ban token. (It's a {6} artifact with \"Creature spells cost {2} more to cast.\")";

export default defineCard({
  name: "Feroz, Ulgrotha's Warden",
  manaCost: "{3}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Feroz"],
  loyalty: 5,
  canBeCommander: true,
  text: `${PLUS}\n${ZERO}\n${MINUS}\nFeroz, Ulgrotha's Warden can be your commander.`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Blue Bird Token", count: 2 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: {
              typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
              manaValue: { op: "lte", n: 4 },
            },
          },
        ],
      },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Feroz's Ban Token", count: 1 },
      resolve: null,
      text: MINUS,
    },
  ],
});

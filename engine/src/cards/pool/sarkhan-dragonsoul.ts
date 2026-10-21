import { defineCard } from "../define.js";

const PLUS_TEXT = "+2: Sarkhan deals 1 damage to each opponent and each creature your opponents control.";
const MINUS_TEXT = "−3: Sarkhan deals 4 damage to target player or planeswalker.";
const ULT_TEXT = "−9: Search your library for any number of Dragon creature cards, put them onto the battlefield, then shuffle.";

export default defineCard({
  name: "Sarkhan, Dragonsoul",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sarkhan"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature", subtype: "Dragon" },
        destination: "battlefield",
        min: 0,
        max: { librarySize: "you" },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});

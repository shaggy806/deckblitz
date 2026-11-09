import { defineCard } from "../define.js";

// War of the Spark. Only an opponent's own search of their own library by their
// own spell or ability: your Path to Exile still lets them search, and another
// opponent's search of their library still goes ahead (the rulings).
const STATIC_TEXT = "Spells and abilities your opponents control can't cause their controller to search their library.";
const MINUS_ONE_TEXT = "[−1]: Target player mills four cards. Then exile each opponent's graveyard.";

export default defineCard({
  name: "Ashiok, Dream Render",
  manaCost: "{1}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ashiok"],
  loyalty: 5,
  text: `${STATIC_TEXT}\n${MINUS_ONE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      text: STATIC_TEXT,
      prohibits: [{ act: "search", who: "opponents", causedByThemselves: true }],
    },
  ],
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 4 },
          { kind: "exile-graveyard", target: "each-opponent" },
        ],
      },
      resolve: null,
      text: MINUS_ONE_TEXT,
    },
  ],
});

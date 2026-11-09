import { defineCard } from "../define.js";

// EDHREC rank 2797. "You played a land": the land drop itself (rule 305.1), so
// a land put onto the battlefield doesn't count (the ruling).
export default defineCard({
  name: "River of Tears",
  colors: [],
  types: ["land"],
  text: "{T}: Add {U}. If you played a land this turn, add {B} instead.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { ifCondition: { kind: "turn-history", what: "lands-played", atLeast: 1 }, thenOneOf: ["B"], elseOneOf: ["U"] },
        amount: 1,
      },
      resolve: null,
      text: "{T}: Add {U}. If you played a land this turn, add {B} instead.",
    },
  ],
});

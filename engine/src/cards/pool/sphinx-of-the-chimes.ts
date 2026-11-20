import { defineCard } from "../define.js";

// EDHREC rank 18810.
//
// The discard is the cost's (rule 602.2b), chosen as it's paid: two nonland
// cards sharing one name (`sameName`), offered only while the hand holds
// such a pair (rule 201.2a: "same name").

const DRAW = "Discard two nonland cards with the same name: Draw four cards.";

export default defineCard({
  name: "Sphinx of the Chimes",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${DRAW}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 2, filter: { notTypes: ["land"] }, sameName: true } },
      targets: [],
      effect: { kind: "draw", amount: 4 },
      resolve: null,
      text: DRAW,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 15284.
//
// Rulings:
//   [2023-04-14] Xerex Strobe-Knight will count any spells you've cast this turn. It doesn't
//     matter if those spells resolved, didn't resolve, were countered, or are still on the stack.

const TEXT =
  "{T}: Create a 2/2 white and blue Knight creature token with vigilance. Activate only if you've cast two or more spells this turn.";

export default defineCard({
  name: "Xerex Strobe-Knight",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token (Chivalric Alliance)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

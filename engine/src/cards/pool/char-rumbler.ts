import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 30358.
//
// Rulings:
//   [2007-05-01] Yes, Char-Rumbler's printed power is -1. While its power is -1 or 0, it simply
//     deals no combat damage.

const PUMP_TEXT = "{R}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Char-Rumbler",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: -1,
  toughness: 3,
  keywords: ["double-strike"],
  text: `Double strike\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});

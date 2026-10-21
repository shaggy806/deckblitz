import { defineCard } from "../define.js";

// EDHREC rank 31518.
//
// Rulings:
//   [2004-10-04] Can be used on a creature without Flying with no effect.

const TEXT = "{T}: Target creature loses flying until end of turn.";

export default defineCard({
  name: "Radjan Spirit",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});

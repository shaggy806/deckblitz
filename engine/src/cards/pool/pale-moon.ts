import { defineCard } from "../define.js";

// Nemesis.
//
// Rulings:
//   [2004-10-04] The ability does not change the amount of mana produced, only the color.

const TEXT = "Until end of turn, if a player taps a nonbasic land for mana, it produces colorless mana instead of any other type.";

export default defineCard({
  name: "Pale Moon",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "player-effect",
    duration: "end-of-turn",
    landManaInstead: { filter: { notSupertype: "basic" }, produces: "C", tapper: "any" },
  },
});

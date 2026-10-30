import { defineCard } from "../define.js";
import { CHOSEN_COLOR } from "../../effects.js";

// Rulings:
//   Sudden Demise will deal damage to a multicolored creature if one of its colors is the
//     chosen color.
//   You choose the value for X as you cast Sudden Demise. You don't choose the color until it
//     resolves.
//
// X is the spell's own, chosen as it's cast; the colour is chosen as it
// resolves (`choose-value`), and `then` still reads that X.

export default defineCard({
  name: "Sudden Demise",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose a color. Sudden Demise deals X damage to each creature of the chosen color.",
  effect: {
    kind: "choose-value",
    value: "color",
    then: { kind: "damage-all", filter: { type: "creature", colors: [CHOSEN_COLOR] }, amount: "x" },
  },
});

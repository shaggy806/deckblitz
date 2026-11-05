import { defineCard } from "../define.js";
import { CHOSEN_COLOR } from "../../effects.js";

// EDHREC rank 27653. The colour is chosen as it resolves (its ruling).

export default defineCard({
  name: "Searing Rays",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose a color. Searing Rays deals damage to each player equal to the number of creatures of that color that player controls.",
  effect: {
    kind: "choose-value",
    value: "color",
    then: {
      kind: "damage",
      who: "each-player",
      amount: { countOf: { type: "creature", colors: [CHOSEN_COLOR], controlledBy: "you" }, forEachPlayer: true },
    },
  },
});

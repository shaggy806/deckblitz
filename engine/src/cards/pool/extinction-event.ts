import { CHOSEN_CREATURE_TYPE, ODD_OR_EVEN } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 9731.

export default defineCard({
  name: "Extinction Event",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose odd or even. Exile each creature with mana value of the chosen quality. (Zero is even.)",
  effect: {
    kind: "choose-creature-type",
    options: ODD_OR_EVEN,
    prompt: "Choose odd or even",
    then: { kind: "exile-all", filter: { type: "creature", manaValueParity: CHOSEN_CREATURE_TYPE } },
  },
});

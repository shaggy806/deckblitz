import { defineCard } from "../define.js";
import { CHOSEN_CREATURE_TYPE } from "../helpers.js";

// EDHREC rank 14016. Kindred Dominance's effect, in white.

export default defineCard({
  name: "Kindred Judgment",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose a creature type. Destroy all creatures that aren't of the chosen type.",
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "destroy-all",
      filter: { type: "creature", notSubtypes: [CHOSEN_CREATURE_TYPE] },
    },
  },
});

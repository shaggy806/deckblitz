import { defineCard } from "../define.js";
import { CHOSEN_CREATURE_TYPE } from "../../effects.js";

export default defineCard({
  name: "For the Ancestors",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose a creature type. Look at the top six cards of your library. You may reveal any number of cards of the chosen type from among them and put the revealed cards into your hand. Put the rest on the bottom of your library in a random order.\nFlashback {3}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  flashback: { cost: "{3}{G}" },
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "look-and-choose",
      zone: "library",
      count: 6,
      min: 0,
      max: 6,
      filter: { subtype: CHOSEN_CREATURE_TYPE },
      reveal: "chosen",
      destination: "hand",
      leftover: "bottom-random",
    },
  },
});

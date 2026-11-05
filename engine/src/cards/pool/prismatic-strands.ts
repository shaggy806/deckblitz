import { CHOSEN_COLOR } from "../../effects.js";
import { defineCard } from "../define.js";

export default defineCard({
  name: "Prismatic Strands",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  flashback: { cost: "", tapCreatures: { filter: { type: "creature", colors: ["W"] }, count: 1 } },
  text: "Prevent all damage that sources of the color of your choice would deal this turn.\nFlashback—Tap an untapped white creature you control. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  // The colour is chosen as it resolves (rule 608.2), not as it's cast.
  effect: {
    kind: "choose-value",
    value: "color",
    then: { kind: "damage-rule", by: { filter: { colors: [CHOSEN_COLOR] } } },
  },
});

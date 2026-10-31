import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const FLASH_TEXT = "{1}, {T}, Sacrifice this land: You may cast spells this turn as though they had flash.";

export default defineCard({
  name: "Emergence Zone",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${FLASH_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", castAsThoughFlash: {} },
      resolve: null,
      text: FLASH_TEXT,
    },
  ],
});

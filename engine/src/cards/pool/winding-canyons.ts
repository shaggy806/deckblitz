import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const FLASH_TEXT = "{2}, {T}: You may cast creature spells this turn as though they had flash.";

export default defineCard({
  name: "Winding Canyons",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${FLASH_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        castAsThoughFlash: { filter: { type: "creature" } },
      },
      resolve: null,
      text: FLASH_TEXT,
    },
  ],
});

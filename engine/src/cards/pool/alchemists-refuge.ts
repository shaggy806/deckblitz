import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const FLASH_TEXT = "{G}{U}, {T}: You may cast spells this turn as though they had flash.";

export default defineCard({
  name: "Alchemist's Refuge",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${FLASH_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{G}{U}", tap: true },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", castAsThoughFlash: {} },
      resolve: null,
      text: FLASH_TEXT,
    },
  ],
});

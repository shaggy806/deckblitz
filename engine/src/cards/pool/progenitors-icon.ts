import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const FLASH_TEXT = "{T}: The next spell of the chosen type you cast this turn can be cast as though it had flash.";

// The type is read as the ability resolves and fixed from then on; with no
// type chosen (somehow on the battlefield without one), the ability does
// nothing (the ruling). A spell of the type is one with that subtype — a
// kindred spell or a changeling too.
export default defineCard({
  name: "Progenitor's Icon",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose a creature type.\n{T}: Add one mana of any color.\n${FLASH_TEXT}`,
  chooseCreatureTypeOnEnter: true,
  activated: [
    addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." }),
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        castAsThoughFlash: { filter: { ofChosenType: true }, next: true },
      },
      resolve: null,
      text: FLASH_TEXT,
    },
  ],
});

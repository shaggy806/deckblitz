import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { LAND_TYPES } from "../../subtypes.js";

const NONBASIC_LAND_TYPES = LAND_TYPES.filter((type) => !BASIC_LAND_TYPE_CHOICES.includes(type));
const CHOSEN_LANDS = { type: "land", controlledBy: "you", subtype: CHOSEN_CREATURE_TYPE } as const;

// The type is chosen as it resolves (rule 608.2d). Haste is granted first:
// once the lands are copies of the creature they're no longer lands of that
// type, and both parts apply to the same lands, fixed now (rule 611.2c).
// Nothing enters, so no "enters" ability of the copied creature applies (the
// ruling, rule 707.4).
export default defineCard({
  name: "March from Velis Vel",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{4}{U}" },
  text: "Choose a nonbasic land type. Each land you control of that type becomes a copy of target creature you control until end of turn and gains haste until end of turn.\nFlashback {4}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "choose-creature-type",
    options: NONBASIC_LAND_TYPES,
    prompt: "choose a nonbasic land type",
    then: {
      kind: "sequence",
      effects: [
        { kind: "grant-keyword-all", filter: CHOSEN_LANDS, keyword: "haste", duration: "end-of-turn" },
        { kind: "become-copy", filter: CHOSEN_LANDS, of: 0, until: "end-of-turn" },
      ],
    },
  },
});

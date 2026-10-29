import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// EDHREC rank 31021. Tideshaper Mystic without the timing limit: the type is
// chosen as the ability resolves (rule 608.2d), and the land loses its other
// land types and its rules-text abilities until end of turn (rule 305.7).

const TEXT = "{T}: Target land becomes the basic land type of your choice until end of turn.";

export default defineCard({
  name: "Sea Snidd",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "choose a basic land type",
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

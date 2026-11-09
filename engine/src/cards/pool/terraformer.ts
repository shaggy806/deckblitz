import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// The type is chosen as the ability resolves (608.2d); each land loses its
// other land types and its rules-text abilities until end of turn (305.7).

const TEXT = "{1}: Choose a basic land type. Each land you control becomes that type until end of turn.";

export default defineCard({
  name: "Terraformer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "Choose a basic land type",
        then: {
          kind: "for-each-permanent",
          filter: { type: "land", controlledBy: "you" },
          simultaneous: true,
          effect: { kind: "become", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

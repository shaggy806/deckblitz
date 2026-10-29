import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// The type is chosen as the ability resolves (rule 608.2d); the land loses
// its other land types and its rules-text abilities until end of turn (305.7).
export default defineCard({
  name: "Tideshaper Mystic",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: Target land becomes the basic land type of your choice until end of turn. Activate only during your turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "Choose a basic land type",
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{T}: Target land becomes the basic land type of your choice until end of turn. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
});

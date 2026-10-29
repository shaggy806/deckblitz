import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// The type is chosen as the ability resolves (the ruling); the land loses its
// other land types and its rules-text abilities until end of turn (305.7).
export default defineCard({
  name: "Unstable Frontier",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{T}: Target land you control becomes the basic land type of your choice until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["land-you-control"],
      effect: {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "choose a basic land type",
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{T}: Target land you control becomes the basic land type of your choice until end of turn.",
    },
  ],
});

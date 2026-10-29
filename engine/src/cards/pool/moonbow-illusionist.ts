import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// The type is chosen as the ability resolves (rule 608.2d); only the target
// changes, keeping its name and supertypes (the rulings, rule 305.7).
export default defineCard({
  name: "Moonbow Illusionist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{2}, Return a land you control to its owner's hand: Target land becomes the basic land type of your choice until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: ["land"],
      effect: {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "choose a basic land type",
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{2}, Return a land you control to its owner's hand: Target land becomes the basic land type of your choice until end of turn.",
    },
  ],
});

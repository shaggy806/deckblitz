import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 22840.
//
// Mistform Dreamer's ability, on the Aura: the enchanted creature (`"attached"`)
// becomes the type chosen as it resolves.

const TEXT = "{1}: Enchanted creature becomes the creature type of your choice until end of turn.";

export default defineCard({
  name: "Mistform Mask",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "add-types", target: "attached", setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

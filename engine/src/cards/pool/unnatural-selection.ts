import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 13371.
//
// Imagecrafter's ability for {1}: `choose-creature-type` with `exclude`, then
// `add-types`' `setSubtypes` (rule 205.1a).
//
// Rulings:
//   You must choose a creature type that already exists in Magic.

const TEXT = "{1}: Choose a creature type other than Wall. Target creature becomes that type until end of turn.";

export default defineCard({
  name: "Unnatural Selection",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "choose-creature-type",
        exclude: ["Wall"],
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

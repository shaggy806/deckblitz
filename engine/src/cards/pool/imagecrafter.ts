import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 14252.
//
// `choose-creature-type` with `exclude`, then `add-types`' `setSubtypes` (rule 205.1a).

export default defineCard({
  name: "Imagecrafter",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: Choose a creature type other than Wall. Target creature becomes that type until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "choose-creature-type",
        exclude: ["Wall"],
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{T}: Choose a creature type other than Wall. Target creature becomes that type until end of turn.",
    },
  ],
});

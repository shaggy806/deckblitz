import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 31203.
//
// The type is chosen as the ability resolves (`choose-creature-type`) and replaces
// its creature types (`add-types`' `setSubtypes`, rule 205.1a).

export default defineCard({
  name: "Mistform Stalker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 1,
  text: "{1}: This creature becomes the creature type of your choice until end of turn.\n{2}{U}{U}: This creature gets +2/+2 and gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "add-types", target: "source", setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{1}: This creature becomes the creature type of your choice until end of turn.",
    },
    {
      cost: { mana: "{2}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "flying",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{2}{U}{U}: This creature gets +2/+2 and gains flying until end of turn.",
    },
  ],
});

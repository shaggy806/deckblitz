import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE, FIRST_CHOSEN_TYPE, LAND_TYPES } from "../helpers.js";

// Both types are chosen as the mode resolves (608.2d), the second nested in
// the first. Which lands are fixed then (611.2c), and each replaces its land
// types with the second (305.7).

const MILL = "Target player mills four cards.";
const LANDS =
  "Choose a land type and a basic land type. Each land of the first chosen type becomes the second chosen type until end of turn.";
const PHASE =
  "Target artifact phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before its controller untaps during their next untap step.)";

export default defineCard({
  name: "Vision Charm",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${MILL}\n• ${LANDS}\n• ${PHASE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MILL,
        targets: ["player"],
        effect: { kind: "mill", target: 0, amount: 4 },
      },
      {
        text: LANDS,
        targets: [],
        effect: {
          kind: "choose-creature-type",
          options: LAND_TYPES,
          prompt: "Choose a land type",
          sentinel: FIRST_CHOSEN_TYPE,
          then: {
            kind: "choose-creature-type",
            options: BASIC_LAND_TYPE_CHOICES,
            prompt: "Choose a basic land type",
            then: {
              kind: "for-each-permanent",
              filter: { type: "land", subtype: FIRST_CHOSEN_TYPE },
              simultaneous: true,
              effect: { kind: "become", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
            },
          },
        },
      },
      {
        text: PHASE,
        targets: ["artifact"],
        effect: { kind: "phase-out", target: 0 },
      },
    ],
  },
});

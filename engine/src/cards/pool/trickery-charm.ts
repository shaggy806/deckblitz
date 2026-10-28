import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 10047.

export default defineCard({
  name: "Trickery Charm",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Target creature gains flying until end of turn.\n• Target creature becomes the creature type of your choice until end of turn.\n• Look at the top four cards of your library, then put them back in any order.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gains flying until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
      {
        text: "Target creature becomes the creature type of your choice until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "choose-creature-type",
          then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
        },
      },
      {
        text: "Look at the top four cards of your library, then put them back in any order.",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 4,
          min: 4,
          max: 4,
          destination: "library-top",
          leftover: "stay",
        },
      },
    ],
  },
});

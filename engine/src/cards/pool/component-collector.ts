import { defineCard } from "../define.js";

// EDHREC rank 25923.
//
// Rulings:
//   [2021-09-24] If a triggered ability triggers whenever day becomes night or night becomes day,
//     it only triggers if it was already either day/night and becomes the other. It does not
//     trigger when the game becomes day or night for the first time.
const TRIGGER_TEXT =
  "Whenever day becomes night or night becomes day, you may tap or untap target nonland permanent.";

export default defineCard({
  name: "Component Collector",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 4,
  becomesDayAsEnters: true,
  text: `If it's neither day nor night, it becomes day as this creature enters.\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: [{ kind: "permanent", filter: { notTypes: ["land"] } }],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

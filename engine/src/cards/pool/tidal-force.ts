import { defineCard } from "../define.js";

// EDHREC rank 16990. Every player's upkeep; "you may tap or untap" is Gandalf
// the Grey's modal — tap, untap, or neither.
const TEXT = "At the beginning of each upkeep, you may tap or untap target permanent.";

export default defineCard({
  name: "Tidal Force",
  manaCost: "{5}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: ["permanent"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target permanent", effect: { kind: "tap", target: 0 } },
          { text: "Untap target permanent", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

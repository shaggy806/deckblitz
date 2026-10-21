import { defineCard } from "../define.js";

// EDHREC rank 30991.

const SWAMP_TEXT = "This creature gets +1/+1 as long as you control a Swamp.";

export default defineCard({
  name: "Sedge Troll",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 2,
  toughness: 2,
  text: `${SWAMP_TEXT}\n{B}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
      grantPt: [1, 1],
      text: SWAMP_TEXT,
    },
  ],
});

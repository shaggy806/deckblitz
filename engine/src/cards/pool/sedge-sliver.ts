import { defineCard } from "../define.js";

// Each Sliver creature has the quoted static (`grantsStatic`), its condition
// read for that Sliver's controller (rule 113.10): an opponent's Sliver gets
// +1/+1 while they control a Swamp.

const PUMP = "All Sliver creatures have \"This creature gets +1/+1 as long as you control a Swamp.\"";
const REGEN = "All Slivers have \"{B}: Regenerate this permanent.\"";

export default defineCard({
  name: "Sedge Sliver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `${PUMP}\n${REGEN}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsStatic: [
        {
          affects: { scope: "self" },
          condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
          grantPt: [1, 1],
          text: "This creature gets +1/+1 as long as you control a Swamp.",
        },
      ],
      text: PUMP,
    },
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: "{B}: Regenerate this permanent.",
        },
      ],
      text: REGEN,
    },
  ],
});

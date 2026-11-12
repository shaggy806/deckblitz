import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 12289. Vein Ripper's ward; Grand Nagus Zek's per-Treasure bonus.
// The sacrifice trigger fires once a turn, so one or many sacrifices at once
// are the same.

const PUMP_TEXT = "Evin gets +2/+0 for each Treasure you control.";
const SAC_TEXT =
  "Whenever one or more players sacrifice one or more creatures, you create a tapped Treasure token. This ability triggers only once each turn.";

export default defineCard({
  name: "Evin, Waterdeep Opportunist",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\nWard—Sacrifice a creature.\n${PUMP_TEXT}\n${SAC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Treasure", controlledBy: "you" }, pt: [2, 0] },
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    ward({ sacrifice: { filter: { type: "creature" }, text: "Sacrifice a creature" } }),
    {
      trigger: { on: "sacrifice", who: "any", filter: { type: "creature" } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// The Brothers' War.
const ISLAND_TEXT = "This creature gets +2/+0 as long as you control an Island.";
const SURVEIL_TEXT = "{2}, {T}: Surveil 1.";

export default defineCard({
  name: "Coastal Bulwark",
  manaCost: "{2}",
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 3,
  keywords: ["defender"],
  text:
    `Defender\n${ISLAND_TEXT}\n${SURVEIL_TEXT} (Look at the top card of your library. ` +
    "You may put that card into your graveyard.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 },
      grantPt: [2, 0],
      text: ISLAND_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});

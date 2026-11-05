import { defineCard } from "../define.js";

// EDHREC rank 25068. The granted ability names the Equipment that granted it
// (`"granter"`, rule 201.5a); the sacrifice's count reads the counters as the
// Equipment last existed, its own sacrifice paid already.

const GRANT_TEXT = "Equipped creature gets +1/+0 for each blood counter on this Equipment and has \"{T}, Sacrifice a creature: Put a blood counter on Rakdos Riteknife.\"";

export default defineCard({
  name: "Rakdos Riteknife",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT_TEXT}\n{B}{R}, Sacrifice this Equipment: Target player sacrifices a permanent of their choice for each blood counter on this Equipment.\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "blood", pt: [1, 0] },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
          targets: [],
          effect: { kind: "add-counter", target: "granter", counter: "blood", amount: 1 },
          resolve: null,
          text: "{T}, Sacrifice a creature: Put a blood counter on Rakdos Riteknife.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{R}", tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "sacrifice", who: "target", filter: {}, count: { countersOn: "source", counter: "blood" } },
      resolve: null,
      text: "{B}{R}, Sacrifice this Equipment: Target player sacrifices a permanent of their choice for each blood counter on this Equipment.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});

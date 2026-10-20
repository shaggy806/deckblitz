import { defineCard } from "../define.js";

// Bearded Axe counts itself (its ruling): it's an Equipment you control.

export default defineCard({
  name: "Bearded Axe",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1 for each Dwarf, Equipment, and/or Vehicle you control.\nEquip {2}",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { controlledBy: "you", subtypes: ["Dwarf", "Equipment", "Vehicle"] },
        pt: [1, 1],
      },
      text: "Equipped creature gets +1/+1 for each Dwarf, Equipment, and/or Vehicle you control.",
    },
  ],
});

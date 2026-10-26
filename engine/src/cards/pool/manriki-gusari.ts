import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 24722. Viridian Longbow's granted-ability shape: the equipped
// creature taps for it.
const GRANTED = "{T}: Destroy target Equipment.";
const TEXT = `Equipped creature gets +1/+2 and has "${GRANTED}"`;

export default defineCard({
  name: "Manriki-Gusari",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [{ kind: "permanent", filter: { subtype: "Equipment" } }],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
});

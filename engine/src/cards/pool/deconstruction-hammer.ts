import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const GRANTED = "{3}, {T}, Sacrifice Deconstruction Hammer: Destroy target artifact or enchantment.";
const TEXT = `Equipped creature gets +1/+1 and has "${GRANTED}"`;

export default defineCard({
  name: "Deconstruction Hammer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsActivated: [
        {
          cost: { mana: "{3}", tap: true, sacrifice: "granter" },
          targets: ["artifact-or-enchantment"],
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

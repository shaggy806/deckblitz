import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 19096. The equipped creature's controller activates the granted
// ability, whoever controls Heartseeker; unattached, it stays on the battlefield.
const GRANTED = "{T}, Unattach Heartseeker: Destroy target creature.";
const TEXT = `Equipped creature gets +2/+1 and has "${GRANTED}"`;

export default defineCard({
  name: "Heartseeker",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {5} ({5}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantsActivated: [
        {
          cost: { mana: null, tap: true, unattach: "granter" },
          targets: ["creature"],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{5}")],
});

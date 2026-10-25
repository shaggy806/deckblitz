import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const GRANTED = "{2}, {T}: Tap target creature.";
const TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Siren Song Lyre",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true },
          targets: ["creature"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{2}")],
});

import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "Trusty Boomerang" in the granted ability is the Equipment that grants it
// (rule 201.5a), returned only while it's still that permanent (400.7).

const GRANTED = "{1}, {T}: Tap target creature. Return Trusty Boomerang to its owner's hand.";
const TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Trusty Boomerang",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: true },
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "tap", target: 0 },
              { kind: "return-to-hand", target: "granter" },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
});

import { defineCard } from "../define.js";

// EDHREC rank 5485.

export default defineCard({
  name: "Rabbit Battery",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Rabbit"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nEquipped creature gets +1/+1 and has haste.\nReconfigure {R} ({R}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {R}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {R}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["haste"],
      text: "Equipped creature gets +1/+1 and has haste.",
    },
  ],
});

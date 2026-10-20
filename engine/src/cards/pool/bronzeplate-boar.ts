import { defineCard } from "../define.js";

// EDHREC rank 14635.

export default defineCard({
  name: "Bronzeplate Boar",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Boar"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nEquipped creature gets +3/+2 and has trample.\nReconfigure {5} ({5}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {5}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {5}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 2],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +3/+2 and has trample.",
    },
  ],
});

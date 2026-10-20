import { defineCard } from "../define.js";

// EDHREC rank 16716.

export default defineCard({
  name: "Webspinner Cuff",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Spider"],
  power: 1,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\nEquipped creature gets +1/+4 and has reach.\nReconfigure {4} ({4}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {4}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {4}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 4],
      grantKeywords: ["reach"],
      text: "Equipped creature gets +1/+4 and has reach.",
    },
  ],
});

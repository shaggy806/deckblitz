import { defineCard } from "../define.js";

// EDHREC rank 15682.

export default defineCard({
  name: "Leech Gauntlet",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Leech"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: "Lifelink\nEquipped creature has lifelink.\nReconfigure {4} ({4}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
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
      grantKeywords: ["lifelink"],
      text: "Equipped creature has lifelink.",
    },
  ],
});

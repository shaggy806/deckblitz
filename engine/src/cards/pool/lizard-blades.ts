import { defineCard } from "../define.js";

// EDHREC rank 1480.

export default defineCard({
  name: "Lizard Blades",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Lizard"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike\nEquipped creature has double strike.\nReconfigure {2} ({2}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {2}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {2}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["double-strike"],
      text: "Equipped creature has double strike.",
    },
  ],
});

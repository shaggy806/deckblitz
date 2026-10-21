import { defineCard } from "../define.js";

// EDHREC rank 13990.
//
// Rulings:
//   The equipped creature has vigilance and menace even if you control no Gates.

export default defineCard({
  name: "Glaive of the Guildpact",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0 for each Gate you control and has vigilance and menace. (A creature with menace can't be blocked except by two or more creatures.)\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Gate", controlledBy: "you" }, pt: [1, 0] },
      grantKeywords: ["vigilance", "menace"],
      text: "Equipped creature gets +1/+0 for each Gate you control and has vigilance and menace.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});

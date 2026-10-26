import { defineCard } from "../define.js";

// Planar Chaos. Tahngarth's Rage's shape: one static per half, gated on the
// enchanted creature's current colours — read continuously, so it flips when
// the creature's colour changes.
const TEXT = "Enchanted creature gets +1/+2 as long as it's white. Otherwise, it gets -2/-1.";

export default defineCard({
  name: "Serra's Boon",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["W"] } } },
      grantPt: [1, 2],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { notColors: ["W"] } } },
      grantPt: [-2, -1],
      text: TEXT,
    },
  ],
});

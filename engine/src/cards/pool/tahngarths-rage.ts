import { defineCard } from "../define.js";

// EDHREC rank 26883. Nyx Infusion's shape: one static per half, gated on whether the
// enchanted creature is attacking — read continuously, so it flips as combat starts and
// ends (the ruling: no new timestamp either way).

const TEXT = "Enchanted creature gets +3/+0 as long as it's attacking. Otherwise, it gets -2/-1.";

export default defineCard({
  name: "Tahngarth's Rage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { attacking: true } } },
      grantPt: [3, 0],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { attacking: false } } },
      grantPt: [-2, -1],
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// An Aura spell whose target is gone never reaches the battlefield, so it
// doesn't trigger (the ruling) — only a leave to the graveyard does.
const LEAVES_TEXT =
  "When this Aura is put into a graveyard from the battlefield, create two 2/2 green Wolf creature tokens.";

export default defineCard({
  name: "Mantle of the Wolf",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +4/+4.\n${LEAVES_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [4, 4], text: "Enchanted creature gets +4/+4." }],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});

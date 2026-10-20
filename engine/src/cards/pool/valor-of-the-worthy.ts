import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 20259. A leaves-the-battlefield trigger of the
// creature this Aura enchanted — Curator's Ward's shape — for any destination.
const PUMP_TEXT = "Enchanted creature gets +1/+1.";
const LEAVES_TEXT = "When enchanted creature leaves the battlefield, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Valor of the Worthy",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${LEAVES_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});

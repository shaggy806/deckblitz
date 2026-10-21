import { defineCard } from "../define.js";

// EDHREC rank 27531.
//
// Rulings:
//   Once the enchanted creature is destroyed, the attacker stays blocked and
//   deals no combat damage unless it has trample or another blocker.

const PT_TEXT = "Enchanted creature gets -6/-0.";
const BLOCK_TEXT = "When enchanted creature blocks, destroy it. (The attacking creature remains blocked.)";

export default defineCard({
  name: "Dwindle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PT_TEXT}\n${BLOCK_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [-6, 0], text: PT_TEXT }],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
});

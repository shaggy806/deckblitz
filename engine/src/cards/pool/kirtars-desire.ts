import { defineCard } from "../define.js";

// EDHREC rank 26171. Aboshan's Desire's threshold shape: "your graveyard" is
// the Aura's controller's.

const ATTACK_TEXT = "Enchanted creature can't attack.";
const BLOCK_TEXT =
  "Threshold — Enchanted creature can't block as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Kirtar's Desire",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack"],
      text: ATTACK_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "threshold" },
      restrictions: ["cant-block"],
      text: BLOCK_TEXT,
    },
  ],
});

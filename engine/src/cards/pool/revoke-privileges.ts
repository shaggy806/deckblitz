import { defineCard } from "../define.js";

const LOCK_TEXT = "Enchanted creature can't attack, block, or crew Vehicles.";

export default defineCard({
  name: "Revoke Privileges",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${LOCK_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block", "cant-crew"],
      text: LOCK_TEXT,
    },
  ],
});

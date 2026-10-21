import { defineCard } from "../define.js";

const LOCK_TEXT = "Enchanted creature can't attack or block.";
const EXILE_TEXT = "{2}{W}: Exile enchanted creature.";

export default defineCard({
  name: "Cooped Up",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${LOCK_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["cant-attack", "cant-block"], text: LOCK_TEXT }],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});

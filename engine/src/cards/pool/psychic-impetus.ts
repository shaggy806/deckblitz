import { defineCard } from "../define.js";

// EDHREC rank 7117.
//
// Parasitic Impetus's shape. "You scry 2" is the Aura's controller's, not the
// attacking creature's (the ruling): the trigger is the Aura's own.
const PUMP_TEXT = "Enchanted creature gets +2/+2 and is goaded.";
const ATTACK_TEXT = "Whenever enchanted creature attacks, you scry 2.";

export default defineCard({
  name: "Psychic Impetus",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT} (It attacks each combat if able and attacks a player other than you if able.)\n${ATTACK_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], goads: true, text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

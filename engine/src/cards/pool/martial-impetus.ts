import { defineCard } from "../define.js";

// EDHREC rank 3817. "Each other creature": not the enchanted one
// (`exceptTriggerObject`); attacking one of your opponents is the filter's
// `attackingOpponent` (a player, not a planeswalker), read from the Aura's
// controller's side.

const PUMP_TEXT = "Enchanted creature gets +1/+1 and is goaded. (It attacks each combat if able and attacks a player other than you if able.)";
const ATTACK_TEXT = "Whenever enchanted creature attacks, each other creature that's attacking one of your opponents gets +1/+1 until end of turn.";

export default defineCard({
  name: "Martial Impetus",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${ATTACK_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], goads: true, text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", attackingOpponent: true },
        exceptTriggerObject: true,
        simultaneous: true,
        effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

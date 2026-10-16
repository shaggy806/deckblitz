import { defineCard } from "../define.js";

// EDHREC rank 10043.
//
// Psychic Impetus's shape. "Defending player" is the player the attack
// trigger names (`"trigger-player"`): the player the enchanted creature
// attacks, or the controller of the planeswalker it attacks. The trigger is
// the Aura's own, so its controller is the Aura's.

const PUMP_TEXT = "Enchanted creature gets +2/+2 and is goaded.";
const ATTACK_TEXT = "Whenever enchanted creature attacks, defending player gets two rad counters.";

export default defineCard({
  name: "Acquired Mutation",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT} (It attacks each combat if able and attacks a player other than you if able.)\n${ATTACK_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], goads: true, text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: 2, who: "trigger-player" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

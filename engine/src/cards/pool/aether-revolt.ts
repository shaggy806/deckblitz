import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 7130. Artist's Talent's +2 noncombat replacement under revolt's
// condition; Territorial Gorger's "whenever you get one or more {E}" — once
// per gain, however many (the ruling), dealing that much.
//
// Rulings:
//   The additional damage is dealt by the original source of the damage, not by Aether Revolt.
//   If you get multiple {E} at once, Aether Revolt's last ability will trigger only once. When the
//     triggered ability resolves, it will deal damage to the target equal to the amount of {E} you
//     gained.

const REVOLT_TEXT =
  "Revolt — As long as a permanent left the battlefield under your control this turn, if a source you control would deal noncombat damage to an opponent or a permanent an opponent controls, it deals that much damage plus 2 instead.";
const ENERGY_TEXT = "Whenever you get one or more {E}, this enchantment deals that much damage to any target.";

export default defineCard({
  name: "Aether Revolt",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${REVOLT_TEXT}\n${ENERGY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: REVOLT_CONDITION,
      replacement: { event: "would-deal-damage", plus: 2, combat: false, to: "opponent-side", source: { controlledBy: "you" } },
      text: REVOLT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "you", counter: "energy", orPlayer: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: ENERGY_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 20447.
//
// Rulings:
//   [2004-10-04] The Hound tokens are put onto the battlefield if it dies during the combat phase,
//     even if it was not an attacker or blocker.

export default defineCard({
  name: "Mongrel Pack",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 4,
  toughness: 1,
  text: "When this creature dies during combat, create four 1/1 green Dog creature tokens.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // "During combat" is part of the trigger event (any step of the
      // combat phase, attacking or not — the ruling), not an intervening if.
      whileCondition: { kind: "turn-structure", duringCombat: true },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Green Dog Token", count: 4 },
      resolve: null,
      text: "When this creature dies during combat, create four 1/1 green Dog creature tokens.",
    },
  ],
});

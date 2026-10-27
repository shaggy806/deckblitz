import { defineCard } from "../define.js";

// EDHREC rank 26206. Ravnica: City of Guilds.
//
// Rulings:
//   [2005-10-01] Searing Meditation doesn’t care how much life you gain. It triggers just once for
//     each life-gaining event, whether it’s 1 life from Firemane Angel or 15 life from
//     Brightflame.

const TEXT = "Whenever you gain life, you may pay {2}. If you do, this enchantment deals 2 damage to any target.";

export default defineCard({
  name: "Searing Meditation",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Pay {2} to have Searing Meditation deal 2 damage?",
        cost: "{2}",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

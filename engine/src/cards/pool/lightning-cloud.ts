import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 28660. Hematite Talisman's shape.
//
// Rulings:
//   Triggers when the spell is cast.
//   You pick the target when putting the triggered ability on the stack, but you don't choose
//     whether or not to pay {R} until the triggered ability resolves.

const TEXT = "Whenever a player casts a red spell, you may pay {R}. If you do, this enchantment deals 1 damage to any target.";

export default defineCard({
  name: "Lightning Cloud",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["R"] } },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Pay {R} to have Lightning Cloud deal 1 damage to the target?",
        cost: "{R}",
        effect: { kind: "damage", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

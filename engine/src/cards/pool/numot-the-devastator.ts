import { defineCard } from "../define.js";

// EDHREC rank 17196.
//
// Rulings:
//   - You choose the targets when the ability is put on the stack, and you choose whether to pay
//     when it resolves. You may choose zero targets. You can pay the mana even if you chose zero
//     targets.

const TEXT =
  "Whenever Numot deals combat damage to a player, you may pay {2}{R}. If you do, destroy up to two target lands.";

export default defineCard({
  name: "Numot, the Devastator",
  manaCost: "{3}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "any-number", of: "land", min: 0, max: 2 }],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} to destroy the targeted lands?",
        cost: "{2}{R}",
        effect: {
          kind: "for-each-target",
          from: 0,
          effect: { kind: "destroy", target: 0 },
          simultaneous: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 21664.
// Rulings:
//   [2004-10-04] A creature is only considered an "unblocked creature" if it is an attacker during
//     combat after blockers are declared.
//   [2004-10-04] The return of this card to your hand is part of the activation cost and is paid
//     on activation.

const TEXT =
  "Return this enchantment to its owner's hand: Prevent all combat damage that would be dealt by target unblocked creature this turn.";

export default defineCard({
  name: "Gossamer Chains",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, returnSelfToHand: true },
      targets: [{ kind: "permanent", filter: { type: "creature", unblocked: true } }],
      effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
      resolve: null,
      text: TEXT,
    },
  ],
});

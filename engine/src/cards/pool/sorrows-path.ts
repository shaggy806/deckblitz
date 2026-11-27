import { defineCard } from "../define.js";

// EDHREC rank 24074.
//
// Rulings:
//   When the first ability is activated, its second ability triggers and goes on the stack on top
//     of the first ability, and resolves first.
//   Abilities that trigger whenever one of the targeted creatures blocks trigger when the first
//     ability resolves; those that trigger whenever an attacking creature becomes blocked don't.
//   If all the creatures one of the targeted creatures was blocking have left combat, the other is
//     considered able to block all of them: it's removed from combat and blocks nothing.
//   Whether those creatures could block all creatures the other is blocking (evasion, protection,
//     blocking restrictions, being tapped, but not costs) is determined as the ability resolves.

const SWAP =
  "{T}: Choose two target blocking creatures controlled by the same opponent. If each of those creatures could block all creatures that the other is blocking, remove both of them from combat. Each one then blocks all creatures the other was blocking.";
const PAIN = "Whenever this land becomes tapped, it deals 2 damage to you and each creature you control.";

const BLOCKER = { kind: "permanent", whose: "opponent", filter: { type: "creature", blocking: true } } as const;

export default defineCard({
  name: "Sorrow's Path",
  types: ["land"],
  text: `${SWAP}\n${PAIN}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [BLOCKER, { kind: "other", of: BLOCKER, than: { slot: 0 }, sameController: true }],
      effect: { kind: "swap-blocks", between: "blockers", first: 0, second: 1 },
      resolve: null,
      text: SWAP,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 2, who: "you" },
          { kind: "damage-all", amount: 2, filter: { type: "creature", controlledBy: "you" } },
        ],
      },
      resolve: null,
      text: PAIN,
    },
  ],
});

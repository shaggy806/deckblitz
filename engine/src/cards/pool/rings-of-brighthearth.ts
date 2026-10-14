import { defineCard } from "../define.js";

// EDHREC rank 1415.
//
// Rulings:
//   [2020-11-10] If paying the activation cost of the ability includes sacrificing Rings of
//     Brighthearth, the ability won't be copied. At the time the ability is considered activated
//     (after all costs are paid), Rings of Brighthearth is no longer on the battlefield.
//   [2020-11-10] The triggered ability of Rings of Brighthearth and the copy it creates both
//     resolve before the ability that caused it to trigger. They resolve even if that ability is
//     countered.
//   [2020-11-10] You can't pay {2} more than once for each time the triggered ability of Rings of
//     Brighthearth resolves.
//   [2020-11-10] An activated mana ability is one that produces mana as it resolves, not one that
//     costs mana to activate.
//   [2020-11-10] If the ability has {X} in its cost, the copy uses the same value of X.
//   [2020-11-10] The copy will have the same targets as the ability it's copying unless you choose
//     new ones. You may change any number of the targets, including all of them or none of them.
//     If, for one of the targets, you can't choose a new legal target, then it remains unchanged
//     (even if the current target is illegal).

export default defineCard({
  name: "Rings of Brighthearth",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Whenever you activate an ability, if it isn't a mana ability, you may pay {2}. If you do, copy that ability. You may choose new targets for the copy.",
  triggered: [
    {
      // Never a mana ability (they don't use the stack); cycling's included.
      // The copy is made even if the ability was countered first, as it
      // last was on the stack (the rulings).
      trigger: { on: "activates-ability", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to copy that ability?",
        cost: "{2}",
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      },
      resolve: null,
      text: "Whenever you activate an ability, if it isn't a mana ability, you may pay {2}. If you do, copy that ability. You may choose new targets for the copy.",
    },
  ],
});

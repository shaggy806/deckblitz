import { defineCard } from "../define.js";

// EDHREC rank 12156.
//
// Rulings:
//   [2025-04-04] If the copied spell divides damage or distributes counters among a number of
//     targets, the division and number of targets can’t be changed. If you choose new targets, you
//     must choose the same number of targets.
//   [2025-04-04] If the spell that’s copied is modal (that is, it says “Choose one —” or the
//     like), the copy will have the same mode or modes. You can’t choose different ones.
//   [2025-04-04] You can’t choose to pay any additional costs for the copy. However, effects based
//     on any additional costs that were paid for the original spell are copied as though those
//     same costs were paid for the copy too.
//   [2025-04-04] After Flamehold Grappler’s last ability resolves, the next spell you cast that
//     turn will be copied whether or not it has targets.
//   [2025-04-04] The copy is created on the stack, so it’s not “cast.” Abilities that trigger when
//     a player casts a spell won’t trigger.
//   [2025-04-04] If the spell that’s copied has an X whose value was determined as it was cast,
//     the copy will have the same value of X.
//   [2025-04-04] The copy created by Flamehold Grappler’s last ability resolves before the spell
//     it’s copying. It resolves even if the original spell is countered before the copy is
//     created.
//   [2025-04-04] If the spell has any targets, the copy will have the same targets unless you
//     choose new ones. You may change any number of the targets, including all of them or none of
//     them. The new targets must be legal.
//   [2025-04-04] A resolving copy of a permanent spell becomes a token. That token isn’t “created”
//     and won’t interact with abilities that care about tokens being created.
//
// Galvanic Iteration's delayed trigger, at any spell (`nextSpell: {}`): once,
// this turn only, the spell as it last was on the stack if it's gone, and a
// copy of a permanent spell becomes a token as it resolves (`copy-spell`).

const TRIGGER_TEXT =
  "When this creature enters, copy the next spell you cast this turn when you cast it. You may choose new targets for the copy.";

export default defineCard({
  name: "Flamehold Grappler",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TRIGGER_TEXT} (A copy of a permanent spell becomes a token.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: {} },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "Copy that spell. You may choose new targets for the copy.",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

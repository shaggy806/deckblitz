import { defineCard } from "../define.js";

// EDHREC rank 17470.
// Makes Jace → "Jace Token".
//
// Rulings:
//   [2026-08-21] If the spell that's copied is modal (that is, it says "Choose one —" or the
//     like), the copy will have the same mode or modes. You can't choose different ones.
//   [2026-08-21] The copy will have the same targets as the spell it's copying unless you choose
//     new ones. You may change any number of the targets, including all of them or none of them.
//     If, for one of the targets, you can't choose a new legal target, then it remains unchanged
//     (even if the current target is illegal).
//   [2026-08-21] If the copied spell divides damage or distributes counters among a number of
//     targets, the division and number of targets can't be changed. If you choose new targets, you
//     must choose the same number of targets.
//   [2026-08-21] The copy is created on the stack, so it's not "cast." Abilities that trigger when
//     a player casts a spell won't trigger.
//   [2026-08-21] Any choices made when the spell resolves won't have been made yet when it's
//     copied. Any such choices will be made separately when the copy resolves.
//   [2026-08-21] Only one loyalty ability of each planeswalker may be activated per turn, no
//     matter how many it has gained.
//   [2026-08-21] Empower Jace won't let you put loyalty counters on nontoken Jace planeswalkers.
//     However, if you control a Jace planeswalker token that you got another way (such as an
//     effect that creates a token that's a copy of a permanent), empower Jace will put loyalty
//     counters on that.
//   [2026-08-21] If the spell that's copied has an X whose value was determined as it was cast,
//     the copy has the same value of X.
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token.
//   [2026-08-21] You can't choose to pay any additional costs for a copied spell. However, effects
//     based on any additional costs that were paid for the original spell are copied as though
//     those same costs were paid for the copy too.
//
// The granted −3 is Ral, Storm Conduit's −2 (a `nextSpell` delayed trigger that
// copies the trigger spell, this turn only), given to each planeswalker you
// control the way Way of the Pyromancer grants its +1.

const EMPOWER_TEXT =
  "When Way of the Cryomancer enters, empower Jace 5. (Put five loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const GRANTED_TEXT =
  "−3: When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.";
const GRANT_TEXT =
  "Planeswalkers you control have \"[−3]: When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.\"";

export default defineCard({
  name: "Way of the Cryomancer",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${EMPOWER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 5 },
      resolve: null,
      text: "When Way of the Cryomancer enters, empower Jace 5.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: -3,
          cost: { mana: null, tap: false },
          targets: [],
          effect: {
            kind: "delayed-trigger",
            at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
            effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
            text: "Copy that spell. You may choose new targets for the copy.",
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});

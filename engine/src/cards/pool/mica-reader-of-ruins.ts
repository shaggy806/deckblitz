import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 13775.
//
// The sacrifice is a choice made as the trigger resolves (Industrial
// Advancement's `each-player-may` shape); only with one made is the spell
// copied — as it is on the stack, or as it last was there if it has left
// (Primal Wellspring's `"trigger-spell"`; Mica's ruling: "It resolves even if
// that spell is countered").
//
// Rulings:
//   [2026-03-20] You can't choose to pay any additional costs for a copied spell. However, effects
//     based on any additional costs that were paid for the original spell are copied as though
//     those same costs were paid for the copy too.
//   [2026-03-20] If the spell that's copied is modal (that is, it says "Choose one —" or the
//     like), the copy will have the same mode or modes. You can't choose different ones.
//   [2026-03-20] The copy will have the same targets as the spell it's copying unless you choose
//     new ones. You may change any number of the targets, including all of them or none of them.
//     If, for one of the targets, you can't choose a new legal target, then it remains unchanged
//     (even if the current target is illegal).
//   [2026-03-20] Mica's last ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.
//   [2026-03-20] Any choices made when the spell resolves won't have been made yet when it's
//     copied. Any such choices will be made separately when the copy resolves.
//   [2026-03-20] If the spell that's copied has an X whose value was determined as it was cast,
//     the copy has the same value of X.
//   [2026-03-20] If the copied spell divides damage or distributes counters among a number of
//     targets, the division and number of targets can't be changed. If you choose new targets, you
//     must choose the same number of targets.
//   [2026-03-20] If a spell with a converge ability is copied, no mana was spent to cast the copy,
//     so the number of colors of mana spent to cast the spell will be zero. The number of colors
//     spent to cast the original spell is not copied.
//   [2026-03-20] The copy is created on the stack, so it's not "cast." Abilities that trigger when
//     a player casts a spell won't trigger.
const WARD_TEXT =
  "Ward—Pay 3 life. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays 3 life.)";
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell, you may sacrifice an artifact. If you do, copy that spell and you may choose new targets for the copy.";

export default defineCard({
  name: "Mica, Reader of Ruins",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 4,
  toughness: 4,
  text: `${WARD_TEXT}\n${COPY_TEXT}`,
  triggered: [
    ward({ payLife: 3 }),
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});

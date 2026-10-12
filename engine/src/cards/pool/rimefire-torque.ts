import { defineCard } from "../define.js";

// EDHREC rank 10788.
//
// Rulings:
//   [2025-11-17] If the spell has any targets, the copy will have the same targets unless you
//     choose new ones. You may change any number of the targets, including all of them or none of
//     them. The new targets must be legal.
//   [2025-11-17] You can't choose to pay any additional costs for the copy. However, effects based
//     on any additional costs that were paid for the original spell are copied as though those
//     same costs were paid for the copy too.
//   [2025-11-17] If the spell that's copied has an X whose value was determined as it was cast,
//     the copy will have the same value of X.
//   [2025-11-17] The copy is created on the stack, so it's not "cast." Abilities that trigger when
//     a player casts a spell (such as conspire's triggered ability that creates a copy of the
//     spell) won't trigger.
//   [2025-11-17] If the copied spell divides damage or distributes counters among a number of
//     targets, the division and number of targets can't be changed. If you choose new targets, you
//     must choose the same number of targets.
//   [2025-11-17] If the spell that's copied is modal (that is, it says "Choose one —" or the
//     like), the copy will have the same mode or modes. You can't choose different ones.

const CHARGE_TEXT = "Whenever a permanent you control of the chosen type enters, put a charge counter on this artifact.";
const COPY_TEXT =
  "{T}, Remove three charge counters from this artifact: When you next cast an instant or sorcery spell this turn, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Rimefire Torque",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `As this artifact enters, choose a creature type.\n${CHARGE_TEXT}\n${COPY_TEXT}`,
  chooseCreatureTypeOnEnter: true,
  triggered: [
    {
      // Any permanent of the chosen type — a creature, a kindred card, a
      // changeling — and not only another one (the text has no "another").
      trigger: { on: "enters-battlefield", who: "you-control", filter: { ofChosenType: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 3 } },
      targets: [],
      // Adaptive Training Post's delayed trigger: the next instant or
      // sorcery its controller casts this turn, once.
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "When you next cast an instant or sorcery spell this turn, copy it. You may choose new targets for the copy.",
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});

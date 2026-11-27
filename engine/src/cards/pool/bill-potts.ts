import { defineCard } from "../define.js";

// EDHREC rank 23482.
//
// Rulings:
//   [2023-10-13] The copy made by Bill's triggered ability is created on the stack, so it's not
//     "cast" or "activated."
//   [2023-10-13] If the spell or ability that's copied has an X whose value was determined as it
//     was cast, the copy will have the same value of X.
//   [2023-10-13] If the spell or ability that's copied is modal (that is, it says "Choose one —"
//     or the like), the copy will have the same mode or modes. You can't choose different ones.
//   [2023-10-13] You can't choose to pay any additional costs for the copy. However, effects
//     based on any additional costs that were paid for the original spell are copied as though
//     those same costs were paid for the copy too.
//   [2023-10-13] The first ability of Bill Potts will trigger as long as it is the only target of
//     that spell or ability, even if that spell or ability could target multiple permanents.
//   [2023-10-13] The copy will have the same targets as the spell or ability it's copying unless
//     you choose new ones. You may change any number of the targets, including all of them or
//     none of them. The new targets must be legal.
//   [2023-10-13] The Doctor's companion ability allows you to have two commanders if one has the
//     ability and the other is a legendary creature that is a Time Lord Doctor and has no other
//     creature types.
//
// One ability with two trigger events, written as two entries joined by
// `sameAbilityAs`, so "This ability triggers only once each turn" (rule
// 603.2) is kept once for both: a copied spell uses up the turn's copy of an
// ability, and the other way round. "Targets only Bill Potts" is every
// target being Bill (`{ only: true, source: true }`), two slots on Bill
// still counting (the ruling). Never a mana ability: none has targets.
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell that targets only Bill Potts or activate an ability that targets only Bill Potts, copy that spell or ability. You may choose new targets for the copy. This ability triggers only once each turn.";

export default defineCard({
  name: "Bill Potts",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 4,
  pairing: { kind: "doctors-companion" },
  text: `${COPY_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { only: true, source: true } },
      },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      oncePerTurn: true,
      resolve: null,
      text: COPY_TEXT,
    },
    {
      trigger: { on: "activates-ability", who: "you", targets: { only: true, source: true } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      oncePerTurn: true,
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});

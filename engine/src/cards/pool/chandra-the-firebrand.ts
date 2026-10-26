import { defineCard } from "../define.js";

// EDHREC rank 13903.
//
// Rulings:
//   [2011-09-22] Chandra's second ability creates a delayed triggered ability that will copy the
//     next instant or sorcery spell you cast that turn, regardless of whether that spell has
//     targets.
//   [2011-09-22] When you activate Chandra's last ability, you choose up to six target creatures
//     and/or players. No damage is divided, and Chandra can't deal more than 6 damage to any one
//     target. Chandra deals 6 damage to each target that is still legal when the ability resolves.
//
// The −2 is Ral, Storm Conduit's; the −6 is Myojin of Roaring Blades' "each of
// up to three targets" carried to six distinct optional slots.

const PLUS_TEXT = "+1: Chandra deals 1 damage to any target.";
const MINUS_TEXT =
  "−2: When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.";
const ULT_TEXT = "−6: Chandra deals 6 damage to each of up to six targets.";

export default defineCard({
  name: "Chandra, the Firebrand",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "Copy that spell. You may choose new targets for the copy.",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "any-target" },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0] } } },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0, 1] } } },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0, 1, 2] } } },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0, 1, 2, 3] } } },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0, 1, 2, 3, 4] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 6, target: 0 },
          { kind: "damage", amount: 6, target: 1 },
          { kind: "damage", amount: 6, target: 2 },
          { kind: "damage", amount: 6, target: 3 },
          { kind: "damage", amount: 6, target: 4 },
          { kind: "damage", amount: 6, target: 5 },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});

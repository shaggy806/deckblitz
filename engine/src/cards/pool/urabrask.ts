import { defineCard } from "../define.js";

// EDHREC rank 1897. Transforms into The Great Work.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2023-04-14] Urabrask will count any instant or sorcery spells you've cast during the turn,
//     whether those spells resolved, didn't resolve, were countered, or left the stack some other
//     way. Urabrask won't count copies of instant and sorcery spells that were created on the
//     stack and not cast.
//   [2023-04-14] Urabrask's second ability isn't a mana ability, even though it causes you to add
//     mana. It uses the stack and can be responded to.
const CAST_TEXT = "Whenever you cast an instant or sorcery spell, Urabrask deals 1 damage to target opponent. Add {R}.";
const FLIP_TEXT =
  "{R}: Exile Urabrask, then return it to the battlefield transformed under its owner's control. " +
  "Activate only as a sorcery and only if you've cast three or more instant and/or sorcery spells this turn.";

export default defineCard({
  name: "Urabrask",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${CAST_TEXT}\n${FLIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "add-mana", mana: "R", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      sorcerySpeed: true,
      condition: { kind: "cast-this-turn", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] }, atLeast: 3 },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Urabrask", "The Great Work"],
  transform: true,
});

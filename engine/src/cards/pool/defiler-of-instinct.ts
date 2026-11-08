import { defineCard } from "../define.js";

// EDHREC rank 5010. Defiler of Vigor's shape.
//
// Rulings:
//   You may only pay the additional cost once per permanent spell.

const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "planeswalker"] as const;
const COST_TEXT =
  "As an additional cost to cast red permanent spells, you may pay 2 life. Those spells cost {R} less to cast if you paid life this way. This effect reduces only the amount of red mana you pay.";
const CAST_TEXT = "Whenever you cast a red permanent spell, this creature deals 1 damage to any target.";

export default defineCard({
  name: "Defiler of Instinct",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Kavu"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${COST_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { colors: ["R"], typesAnyOf: [...PERMANENT_TYPES] },
        reduceColored: "{R}",
        coloredOnly: true,
        optionalLife: 2,
        when: { caster: "you" },
      },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"], typesAnyOf: [...PERMANENT_TYPES] } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

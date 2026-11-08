import { defineCard } from "../define.js";

// EDHREC rank 5812. Defiler of Vigor's shape.
//
// Rulings:
//   You may only pay the additional cost once per permanent spell.

const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "planeswalker"] as const;
const COST_TEXT =
  "As an additional cost to cast black permanent spells, you may pay 2 life. Those spells cost {B} less to cast if you paid life this way. This effect reduces only the amount of black mana you pay.";
const CAST_TEXT =
  "Whenever you cast a black permanent spell, target creature you control gets +1/+1 and gains menace until end of turn.";

export default defineCard({
  name: "Defiler of Flesh",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${COST_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { colors: ["B"], typesAnyOf: [...PERMANENT_TYPES] },
        reduceColored: "{B}",
        coloredOnly: true,
        optionalLife: 2,
        when: { caster: "you" },
      },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"], typesAnyOf: [...PERMANENT_TYPES] } },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

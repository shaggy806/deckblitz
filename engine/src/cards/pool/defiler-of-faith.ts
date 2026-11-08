import { defineCard } from "../define.js";

// EDHREC rank 5078. Defiler of Vigor's shape: the optional 2 life is each white
// permanent spell's own additional cost, once per spell (the ruling).
//
// Rulings:
//   You may only pay the additional cost once per permanent spell.

const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "planeswalker"] as const;
const COST_TEXT =
  "As an additional cost to cast white permanent spells, you may pay 2 life. Those spells cost {W} less to cast if you paid life this way. This effect reduces only the amount of white mana you pay.";
const CAST_TEXT = "Whenever you cast a white permanent spell, create a 1/1 white Soldier creature token.";

export default defineCard({
  name: "Defiler of Faith",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${COST_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { colors: ["W"], typesAnyOf: [...PERMANENT_TYPES] },
        caster: "you",
        reduceColored: "{W}",
        coloredOnly: true,
        optionalLife: 2,
      },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"], typesAnyOf: [...PERMANENT_TYPES] } },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

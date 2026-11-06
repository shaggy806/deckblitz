import { defineCard } from "../define.js";

// Rulings:
//   [2022-09-09] Some players may make the mental shortcut that the Defilers effectively turn one
//     of the colored mana symbols in the spell’s cost into a Phyrexian colored mana symbol.
//     Despite the similarity in function, this ability does not cause the spells to have
//     Phyrexian mana symbols in their costs. Sorry, Rage Extractor!
//   [2022-09-09] You may only pay the additional cost once per permanent spell.

export default defineCard({
  name: "Defiler of Dreams",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Sphinx"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAs an additional cost to cast blue permanent spells, you may pay 2 life. Those spells cost {U} less to cast if you paid life this way. This effect reduces only the amount of blue mana you pay.\nWhenever you cast a blue permanent spell, draw a card.",
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { colors: ["U"], typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"] },
        caster: "you",
        reduceColored: "{U}",
        coloredOnly: true,
        optionalLife: 2,
      },
      text: "As an additional cost to cast blue permanent spells, you may pay 2 life. Those spells cost {U} less to cast if you paid life this way. This effect reduces only the amount of blue mana you pay.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { colors: ["U"], typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"] },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you cast a blue permanent spell, draw a card.",
    },
  ],
});

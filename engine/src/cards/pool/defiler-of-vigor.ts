import { defineCard } from "../define.js";

// Rulings:
//   [2022-09-09] Some players may make the mental shortcut that the Defilers effectively turn one
//     of the colored mana symbols in the spell’s cost into a Phyrexian colored mana symbol.
//     Despite the similarity in function, this ability does not cause the spells to have
//     Phyrexian mana symbols in their costs. Sorry, Rage Extractor!
//   [2022-09-09] You may only pay the additional cost once per permanent spell.

export default defineCard({
  name: "Defiler of Vigor",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wurm"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nAs an additional cost to cast green permanent spells, you may pay 2 life. Those spells cost {G} less to cast if you paid life this way. This effect reduces only the amount of green mana you pay.\nWhenever you cast a green permanent spell, put a +1/+1 counter on each creature you control.",
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { colors: ["G"], typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"] },
        reduceColored: "{G}",
        coloredOnly: true,
        optionalLife: 2,
        when: { caster: "you" },
      },
      text: "As an additional cost to cast green permanent spells, you may pay 2 life. Those spells cost {G} less to cast if you paid life this way. This effect reduces only the amount of green mana you pay.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { colors: ["G"], typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"] },
      },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "Whenever you cast a green permanent spell, put a +1/+1 counter on each creature you control.",
    },
  ],
});

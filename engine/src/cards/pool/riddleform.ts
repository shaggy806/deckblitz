import { defineCard } from "../define.js";

// EDHREC rank 26225.
//
// Rulings:
//   [2020-06-23] The first ability resolves before the spell that caused it to trigger, and
//     resolves even if that spell is countered.
//   [2020-06-23] If it becomes a creature the turn it enters, it can't attack unless it gains haste.

export default defineCard({
  name: "Riddleform",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever you cast a noncreature spell, you may have this enchantment become a 3/3 Sphinx creature with flying in addition to its other types until end of turn.\n{2}{U}: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "{2}{U}: Scry 1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have this enchantment become a 3/3 Sphinx creature with flying until end of turn?",
        effect: {
          kind: "animate",
          target: "source",
          power: 3,
          toughness: 3,
          addTypes: ["creature"],
          addSubtypes: ["Sphinx"],
          keywords: ["flying"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: "Whenever you cast a noncreature spell, you may have this enchantment become a 3/3 Sphinx creature with flying in addition to its other types until end of turn.",
    },
  ],
});

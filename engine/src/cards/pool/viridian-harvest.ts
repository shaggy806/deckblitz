import { defineCard } from "../define.js";

// EDHREC rank 29390.
//
// Rulings:
//   [2011-06-01] If the enchanted artifact and Viridian Harvest are put into the graveyard at the
//     same time, you’ll still gain 6 life.
//
// Tezzeret's Touch's "put into a graveyard" trigger: a `leaves-battlefield` of
// the enchanted permanent to a graveyard, which looks back in time (rule
// 603.10a), so it fires when the two leave together too (the ruling).

const TRIGGER = "When enchanted artifact is put into a graveyard, you gain 6 life.";

export default defineCard({
  name: "Viridian Harvest",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${TRIGGER}`,
  targets: ["artifact"],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: { kind: "gain-life", amount: 6 },
      resolve: null,
      text: TRIGGER,
    },
  ],
});

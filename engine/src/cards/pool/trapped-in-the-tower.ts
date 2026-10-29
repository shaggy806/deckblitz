import { defineCard } from "../define.js";

// Rulings:
//   [2019-10-04] If the enchanted creature gains flying, Trapped in the Tower is put into your
//     graveyard as a state-based action. The creature won't get stuck in the tower again when it
//     loses flying.

export default defineCard({
  name: "Trapped in the Tower",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature without flying\nEnchanted creature can't attack or block, and its activated abilities can't be activated.",
  targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});

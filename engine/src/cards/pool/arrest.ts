import { defineCard } from "../define.js";

// EDHREC rank 11563.
//
// Rulings:
//   [2016-06-08] Activated abilities contain a colon. They’re generally written “[Cost]:
//     [Effect].” Some keywords are activated abilities and will have colons in their reminder
//     text.

export default defineCard({
  name: "Arrest",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block, and its activated abilities can't be activated.",
  targets: ["creature"],
  static: [
    {
      // "Its activated abilities": the host's alone, whoever activates them —
      // not another permanent enchanted by an Aura its controller controls.
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 10775.
//
// "Its activated abilities can't be activated": the enchanted permanent's,
// for every player, mana abilities included.

export default defineCard({
  name: "Stuck in Summoner's Sanctum",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant artifact or creature\nWhen this Aura enters, tap enchanted permanent.\nEnchanted permanent doesn't untap during its controller's untap step and its activated abilities can't be activated.",
  targets: ["artifact-or-creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted permanent.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted permanent doesn't untap during its controller's untap step and its activated abilities can't be activated.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 26224.

const DIES_TEXT = "When enchanted creature dies, surveil 2.";

export default defineCard({
  name: "Failed Conversion",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets -4/-4.\n${DIES_TEXT} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-4, -4],
      text: "Enchanted creature gets -4/-4.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

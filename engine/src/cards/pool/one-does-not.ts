import { defineCard } from "../define.js";

export default defineCard({
  name: "One Does Not",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature does not simply untap during its controller's untap step.\nEnchanted creature has nonbasic landwalk. (It can't simply be blocked as long as defending player controls a nonbasic land.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature does not simply untap during its controller's untap step.",
    },
    {
      affects: { scope: "attached" },
      landwalk: { type: "land", notSupertype: "basic" },
      text: "Enchanted creature has nonbasic landwalk.",
    },
  ],
});

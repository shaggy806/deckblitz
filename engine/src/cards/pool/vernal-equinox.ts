import { defineCard } from "../define.js";

const TEXT = "Any player may cast creature and enchantment spells as though they had flash.";

// A permission for every player, its controller and each opponent alike
// (rule 601.3b) — read as each cast begins, so it ends the moment this
// leaves the battlefield.
export default defineCard({
  name: "Vernal Equinox",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { typesAnyOf: ["creature", "enchantment"] },
      castAsThoughFlashAnyPlayer: true,
      text: TEXT,
    },
  ],
});

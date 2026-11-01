import { defineCard } from "../define.js";

// `controlledBy: "enchanted-player"` with a combat restriction, as Curse of Death's Hold's P/T.

const TEXT = "Creatures enchanted player controls attack each combat if able.";

export default defineCard({
  name: "Curse of the Nightly Hunt",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "enchanted-player" } },
      restrictions: ["must-attack"],
      text: TEXT,
    },
  ],
});

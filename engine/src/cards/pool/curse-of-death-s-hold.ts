import { defineCard } from "../define.js";

// A static over what the enchanted player controls: `controlledBy: "enchanted-player"`.

const TEXT = "Creatures enchanted player controls get -1/-1.";

export default defineCard({
  name: "Curse of Death's Hold",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "enchanted-player" } },
      grantPt: [-1, -1],
      text: TEXT,
    },
  ],
});

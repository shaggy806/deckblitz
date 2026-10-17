import { defineCard } from "../define.js";

// EDHREC rank 18203.
//
// "Is a Spirit … (It loses all other creature types.)" is a layer-4
// `setSubtypes` (Goddric, Cloaked Reveler's), here over the enchanted
// creature; its other subtypes and its card types stay.

const TEXT = "Enchanted creature is a Spirit and can't attack or block.";

export default defineCard({
  name: "Fog on the Barrow-Downs",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT} (It loses all other creature types.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Spirit"],
      restrictions: ["cant-attack", "cant-block"],
      text: TEXT,
    },
  ],
});

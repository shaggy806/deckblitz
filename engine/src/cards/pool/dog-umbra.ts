import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

const TEXT =
  "As long as another player controls enchanted creature, it can't attack or block. Otherwise, this Aura has umbra armor. (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)";

// Read continuously: either permanent changing hands flips it (the rulings).
const ANOTHER_PLAYER_CONTROLS: StaticCondition = {
  kind: "source",
  filter: { attachedTo: { controlledBy: "opponent" } },
};

export default defineCard({
  name: "Dog Umbra",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: ANOTHER_PLAYER_CONTROLS,
      restrictions: ["cant-attack", "cant-block"],
      text: "As long as another player controls enchanted creature, it can't attack or block.",
    },
    {
      // The Aura itself has umbra armor; `Game.umbraArmorInstead` reads the
      // Aura's computed keywords.
      affects: { scope: "self" },
      condition: { kind: "not", of: ANOTHER_PLAYER_CONTROLS },
      grantKeywords: ["umbra-armor"],
      text: "Otherwise, this Aura has umbra armor.",
    },
  ],
});

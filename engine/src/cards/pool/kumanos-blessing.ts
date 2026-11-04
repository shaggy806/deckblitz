import { defineCard } from "../define.js";

// Kumano's Pupils's replacement, about the enchanted creature instead.
const TEXT = "If a creature dealt damage by enchanted creature this turn would die, exile it instead.";

export default defineCard({
  name: "Kumano's Blessing",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  targets: ["creature"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", damagedThisTurnBy: { source: "host" } },
      },
      text: TEXT,
    },
  ],
});

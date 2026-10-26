import { defineCard } from "../define.js";

// Planar Chaos (PLC). Any creature entering, any player's, pumps the
// enchanted creature.
const TEXT = "Whenever a creature enters, enchanted creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Mantle of Leadership",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});

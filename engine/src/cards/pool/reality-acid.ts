import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// Planar Chaos. "Enchanted permanent" as the leaves trigger resolves is the
// one the Aura was last attached to (`attachedHost` falls back to it, rule
// 400.7) — gone itself, the Aura still names it; if that permanent has left
// too, nothing is sacrificed.
const VANISHING = vanishing(3);

export default defineCard({
  name: "Reality Acid",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant permanent\nVanishing 3 (This Aura enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\nWhen this Aura leaves the battlefield, enchanted permanent's controller sacrifices it.",
  targets: ["permanent"],
  static: [...VANISHING.static],
  triggered: [
    ...VANISHING.triggered,
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-target", target: "attached", byItsController: true },
      resolve: null,
      text: "When this Aura leaves the battlefield, enchanted permanent's controller sacrifices it.",
    },
  ],
});

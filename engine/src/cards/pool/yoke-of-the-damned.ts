import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 25153. Any creature dying — the enchanted one
// included (it then has nothing left to destroy) — triggers it.
const DIES_TEXT = "When a creature dies, destroy enchanted creature.";

export default defineCard({
  name: "Yoke of the Damned",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${DIES_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "destroy", target: "attached" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

const ATTACK_TEXT = "All creatures attack enchanted creature's controller each combat if able.";
const DIES_TEXT = "When enchanted creature dies, draw a card.";

// Each one's requirement is obeyed only by attacking that player (rule 508.1d),
// who may be the very player whose creatures they are: then there's nobody to
// obey it by, and it asks nothing.
export default defineCard({
  name: "Public Enemy",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n" + ATTACK_TEXT + "\n" + DIES_TEXT,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      restrictions: [{ kind: "must-attack", at: { controllerOf: "attached" } }],
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

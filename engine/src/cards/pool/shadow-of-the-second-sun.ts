import { defineCard } from "../define.js";

// EDHREC rank 3697. Sphinx of the Second Sun's ability, on an Aura that
// enchants a player: the phase is that player's turn's.
const TEXT =
  "Enchant player\nAt the beginning of each of enchanted player's postcombat main phases, there is an additional beginning phase after this phase. (The end step happens after the added untap, upkeep, and draw steps.)";

export default defineCard({
  name: "Shadow of the Second Sun",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: TEXT,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "attached" },
      targets: [],
      effect: { kind: "additional-beginning-phase" },
      resolve: null,
      text: "At the beginning of each of enchanted player's postcombat main phases, there is an additional beginning phase after this phase.",
    },
  ],
});

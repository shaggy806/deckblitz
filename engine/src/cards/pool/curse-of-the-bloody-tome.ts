import { defineCard } from "../define.js";

// EDHREC rank 12891. "Enchanted player's upkeep" is a `step-begins` trigger
// with `who: "attached"`; that player is the active player. With one card in
// their library they mill it (the ruling).

const TEXT = "At the beginning of enchanted player's upkeep, that player mills two cards.";

export default defineCard({
  name: "Curse of the Bloody Tome",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: { kind: "mill", target: "active-player", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});

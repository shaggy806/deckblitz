import { defineCard } from "../define.js";

// Not a mana ability: it deals damage, so it uses the stack (rule 605.1b),
// above a spell the mana paid for (rule 603.3).
const TEXT = "Whenever a player taps a land for mana, this enchantment deals 1 damage to that player.";

export default defineCard({
  name: "Manabarbs",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});

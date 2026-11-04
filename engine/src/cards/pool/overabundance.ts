import { defineCard } from "../define.js";

// A triggered mana ability (rule 605.1b): the damage is part of it, so it
// happens at once, off the stack (rule 605.4a), by hand or paying a cost.

const TEXT =
  "Whenever a player taps a land for mana, that player adds one mana of any type that land produced, and this enchantment deals 1 damage to the player.";

export default defineCard({
  name: "Overabundance",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "produced",
        amount: 1,
        also: { kind: "damage", amount: 1, who: "trigger-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

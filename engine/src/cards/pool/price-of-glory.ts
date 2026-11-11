import { defineCard } from "../define.js";

// EDHREC rank 5873. "If it's not that player's turn" is asked of the player
// who tapped the land, as it triggers and again as it resolves (rule 603.4).
const TEXT = "Whenever a player taps a land for mana, if it's not that player's turn, destroy that land.";

export default defineCard({
  name: "Price of Glory",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land" } },
      condition: {
        kind: "not",
        of: { kind: "of-player", player: "that-player", condition: { kind: "your-turn" } },
      },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});

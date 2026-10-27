import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 15573. Felidar Sovereign's upkeep win with a
// library-size intervening if (rule 603.4: checked as it triggers and again
// as it resolves).

const TEXT = "At the beginning of your upkeep, if you have 200 or more cards in your library, you win the game.";

export default defineCard({
  name: "Battle of Wits",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "library-size", who: "you", atLeast: 200 },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: TEXT,
    },
  ],
});

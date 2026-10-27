import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 17268. The targeted opponent's choice (Carrion
// Rats' graveyard option, asked of one player); a player with an empty
// graveyard can't, so didn't. The draw after is yours, and optional.

const TEXT =
  "At the beginning of your upkeep, target opponent may exile a card from their graveyard. If that player doesn't, you may draw a card.";

export default defineCard({
  name: "Gravestorm",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [{ exileFromGraveyard: 1, text: "Exile a card from your graveyard" }],
        ifDidnt: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

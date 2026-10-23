import { defineCard } from "../define.js";

// EDHREC rank 7760. Storm World's upkeep shape: "that player" is the active
// player, and X is their hand as the trigger resolves.

const TEXT = "At the beginning of each player's upkeep, that player mills X cards, where X is the number of cards in their hand.";

export default defineCard({
  name: "Dreamborn Muse",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "mill", target: "active-player", amount: { cardsInHand: "active-player" } },
      resolve: null,
      text: TEXT,
    },
  ],
});

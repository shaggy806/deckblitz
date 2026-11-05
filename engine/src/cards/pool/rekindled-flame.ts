import { defineCard } from "../define.js";

// An intervening if over every opponent (the rulings): some one of them with
// an empty hand as it triggers and again as it resolves, not necessarily the
// same one.

const RETURN_TEXT =
  "At the beginning of your upkeep, if an opponent has no cards in hand, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Rekindled Flame",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Rekindled Flame deals 4 damage to any target.\n${RETURN_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "of-player", player: "an-opponent", condition: { kind: "hand-size", atMost: 0 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Rekindled Flame from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});

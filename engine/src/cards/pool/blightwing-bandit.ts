import { defineCard } from "../define.js";

// "That player" is the opponent whose turn it is — the active player.

const TRIGGER_TEXT =
  "Whenever you cast your first spell during each opponent's turn, look at the top card of that player's library, then exile it face down. You may play that card for as long as it remains exiled, and mana of any type can be spent to cast it.";

export default defineCard({
  name: "Blightwing Bandit",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "active-player",
        duration: "while-exiled",
        faceDown: true,
        spendAs: "any-type",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 19146. Each other player — each
// opponent, in a free-for-all — is asked in turn; the return is that player's
// own effect, so "your graveyard" is theirs and they pick the card.

const TEXT =
  "When this creature enters, each other player may return a creature card from their graveyard to the battlefield.";

export default defineCard({
  name: "Enslaved Horror",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      resolve: null,
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Return a creature card from your graveyard to the battlefield?",
        effect: { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: 1 },
      },
      text: TEXT,
    },
  ],
});

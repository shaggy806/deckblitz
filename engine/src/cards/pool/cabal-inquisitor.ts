import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 30338. Cabal Torturer's threshold activation
// with Cryptwailing's graveyard cost and sorcery timing.

const TEXT =
  "Threshold — {1}{B}, {T}, Exile two cards from your graveyard: Target player discards a card. Activate only as a sorcery and only if there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Cabal Inquisitor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, exileFromGraveyard: { count: 2 } },
      condition: { kind: "threshold" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      sorcerySpeed: true,
      resolve: null,
      text: TEXT,
    },
  ],
});

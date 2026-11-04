import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// Commander Legends: Battle for Baldur's Gate. "That player" is the player
// dealt the damage, compared against every other player (each of them an
// opponent of theirs, rule 102.3): your own hand, lands and life count, and a
// tie for the most isn't "more". Each is read as its turn in the sequence comes
// (the ruling), so the card this draws counts for nothing here unless you're
// that player.

const TEXT =
  "Whenever this creature deals combat damage to a player, draw a card if that player has more cards in hand than each other player. Then you create a Treasure token if that player controls more lands than each other player. Then you gain 3 life if that player has more life than each other player.";

export default defineCard({
  name: "Battle Angels of Tyr",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying, myriad\n${TEXT}`,
  triggered: [
    myriad(),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: {
              kind: "of-player",
              player: "that-player",
              condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
            },
            then: { kind: "draw", amount: 1 },
          },
          {
            kind: "conditional",
            condition: {
              kind: "of-player",
              player: "that-player",
              condition: { kind: "player-compare", stat: { controls: { type: "land" } }, compare: "more", than: "each-opponent" },
            },
            then: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
          {
            kind: "conditional",
            condition: {
              kind: "of-player",
              player: "that-player",
              condition: { kind: "player-compare", stat: "life", compare: "more", than: "each-opponent" },
            },
            then: { kind: "gain-life", amount: 3 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

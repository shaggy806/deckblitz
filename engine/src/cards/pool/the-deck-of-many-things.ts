import { defineCard } from "../define.js";

// The result is the die's after subtracting the cards in hand (rule 706.2, its
// ruling), so the table reads it: 0 or less is the discard, and 20 needs an
// empty hand. "That creature" is the card put onto the battlefield, watched by
// a delayed ability (rule 603.7): "its owner" is whoever owns it, who loses
// the game however it came to die (104.3e).
const TEXT =
  "{2}, {T}: Roll a d20 and subtract the number of cards in your hand. If the result is 0 or less, discard your hand.\n1—9 | Return a card at random from your graveyard to your hand.\n10—19 | Draw two cards.\n20 | Put a creature card from any graveyard onto the battlefield under your control. When that creature dies, its owner loses the game.";

const ROCK_BOTTOM = -1_000_000;

export default defineCard({
  name: "The Deck of Many Things",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        modifier: { product: [{ cardsInHand: "you" }, -1] },
        table: [
          { min: ROCK_BOTTOM, max: 0, effect: { kind: "discard-hand", who: "you" } },
          {
            min: 1,
            max: 9,
            effect: {
              kind: "choose-random-card",
              zone: "graveyard",
              then: { kind: "return-to-hand", target: 0, from: "graveyard" },
            },
          },
          { min: 10, max: 19, effect: { kind: "draw", amount: 2 } },
          {
            min: 20,
            effect: {
              kind: "look-and-choose",
              zone: "graveyards",
              filter: { type: "creature" },
              min: 1,
              max: 1,
              destination: "battlefield",
              leftover: "stay",
              then: {
                kind: "delayed-trigger",
                at: { leaves: 0, to: ["graveyard"] },
                effect: { kind: "lose-game", who: { ownerOf: "trigger-object" } },
                text: "When that creature dies, its owner loses the game.",
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

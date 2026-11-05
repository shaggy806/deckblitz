import { defineCard } from "../define.js";

// EDHREC rank 10623.
//
// An intervening "if", read as it attacks and again as it resolves (the ruling). The permission
// outlives the Robber and needs no particular Rogue, this turn or a later one (the rulings). A gate
// is read from the exiled card's side, whose "you" here is its owner, not the Robber's controller:
// but a player attacks only on their own turn (rule 506.2), so "you attacked with a Rogue this turn"
// is "it's your turn and the active player did". "Cast", so a land can't be played (the ruling).

const TEXT =
  "Whenever this creature attacks, if defending player has more cards in hand than you, exile the top card of their library. During any turn you attacked with a Rogue, you may cast that card and you may spend mana as though it were mana of any color to cast that spell.";

export default defineCard({
  name: "Robber of the Rich",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["reach", "haste"],
  text: `Reach, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "player-compare", stat: "hand", compare: "fewer", than: "that-player" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "trigger-player",
        duration: "while-exiled",
        castOnly: true,
        spendAs: "any-color",
        yourTurnOnly: true,
        gate: {
          kind: "of-player",
          player: "active-player",
          condition: { kind: "turn-history", what: "attackers", filter: { subtype: "Rogue" } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

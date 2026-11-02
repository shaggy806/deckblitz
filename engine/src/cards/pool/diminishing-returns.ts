import { defineCard } from "../define.js";

// "First the player whose turn it is chooses how many cards to draw, then draws
// those cards, then each other player in turn order does the same" (the
// ruling): one `choose-value` of a number per player, each drawn before the
// next is asked. The spell is on the stack as it resolves, so it never shuffles
// itself in (the ruling).
export default defineCard({
  name: "Diminishing Returns",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "Each player shuffles their hand and graveyard into their library. " +
    "You exile the top ten cards of your library. Then each player draws up to seven cards.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
      { kind: "exile-from-library", amount: 10 },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "choose-value",
          value: "number",
          who: "that-player",
          min: 0,
          max: 7,
          prompt: "How many cards do you draw?",
          then: { kind: "draw", amount: "x", who: "that-player" },
        },
      },
    ],
  },
});

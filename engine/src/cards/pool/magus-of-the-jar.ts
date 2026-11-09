import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "{T}, Sacrifice this creature: Each player exiles all cards from their hand face down and draws seven cards. At the beginning of the next end step, each player discards their hand and returns to their hand each card they exiled this way.";

export default defineCard({
  name: "Magus of the Jar",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "each-player", fromHand: "only", faceDown: true },
          { kind: "draw", amount: 7, who: "each-player" },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "exiled",
            orNone: true,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard-hand", who: "each-player" },
                {
                  kind: "for-each-target",
                  from: 0,
                  simultaneous: true,
                  effect: { kind: "return-to-hand", target: 0, from: "exile" },
                },
              ],
            },
            text: "Each player discards their hand and returns to their hand each card they exiled this way.",
          },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});

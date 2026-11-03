import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "{T}, Sacrifice this artifact: Each player exiles all cards from their hand face down and draws seven cards. At the beginning of the next end step, each player discards their hand and returns to their hand each card they exiled this way.";

// One exile event (rule 406.3: nobody may look), then one delayed ability
// about what it exiled, set up even if every hand was empty: the seven still go.

export default defineCard({
  name: "Memory Jar",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
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
            at: "next-end-step",
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

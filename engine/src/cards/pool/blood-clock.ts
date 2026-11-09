import { defineCard } from "../define.js";

const TEXT = "At the beginning of each player's upkeep, that player returns a permanent they control to its owner's hand unless they pay 2 life.";

// EDHREC rank 15682. A player who can't pay must return one; a player with no
// permanents may still choose to pay, though nothing else happens (the rulings).
export default defineCard({
  name: "Blood Clock",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ payLife: 2, text: "Pay 2 life" }],
        otherwise: {
          kind: "choose-permanents",
          chooser: "active-player",
          filter: { controlledBy: "you" },
          min: 1,
          upTo: 1,
          then: { kind: "return-to-hand", target: 0 },
          prompt: "Return a permanent you control to its owner's hand.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

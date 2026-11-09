import { defineCard } from "../define.js";

const TEXT = "At the beginning of each player's upkeep, that player may pay 2 life. If they don't, they return a permanent they control to its owner's hand.";

// EDHREC rank 15511.
export default defineCard({
  name: "Umbilicus",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Pay 2 life? If you don't, return a permanent you control to its owner's hand.",
        options: [{ payLife: 2, text: "Pay 2 life" }],
        ifDidnt: {
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

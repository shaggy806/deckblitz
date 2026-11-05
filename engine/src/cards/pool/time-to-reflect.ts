import { defineCard } from "../define.js";

// EDHREC rank 24245.

export default defineCard({
  name: "Time to Reflect",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature that blocked or was blocked by a Zombie this turn.",
  targets: [
    {
      kind: "permanent",
      filter: {
        type: "creature",
        blockedThisTurn: { relation: "either", partner: { subtype: "Zombie" } },
      },
    },
  ],
  effect: { kind: "exile", target: 0 },
});

import { defineCard } from "../define.js";

// EDHREC rank 11114.
//
// The count of attacking creatures you control is read as the spell resolves;
// "that much" is the life the opponent actually lost (`lifeLostThisWay`).

export default defineCard({
  name: "Foul-Tongue Shriek",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target opponent loses 1 life for each attacking creature you control. You gain that much life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "lose-life",
        target: 0,
        amount: { countOf: { type: "creature", attacking: true, controlledBy: "you" } },
      },
      { kind: "gain-life", amount: { lifeLostThisWay: true } },
    ],
  },
});

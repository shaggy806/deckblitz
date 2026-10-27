import { defineCard } from "../define.js";

export default defineCard({
  name: "Peel from Reality",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature you control and target creature you don't control to their owners' hands.",
  targets: [
    { kind: "permanent", filter: { type: "creature", controlledBy: "you" } },
    { kind: "permanent", filter: { type: "creature", controlledBy: "opponent" } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 24935.

export default defineCard({
  name: "Razor Barrier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target permanent you control gains protection from artifacts or from the color of your choice until end of turn.",
  targets: [{ kind: "permanent", whose: "you", filter: {} }],
  effect: {
    kind: "grant-protection",
    target: 0,
    from: { choose: "color", or: [{ text: "artifacts", from: { types: ["artifact"] } }] },
    duration: "end-of-turn",
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 20303.
// Garruk, Apex Predator's shape: the life is the creature's power as it last
// existed, so an indestructible one still gains it.

export default defineCard({
  name: "Chastise",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking creature. You gain life equal to its power.",
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { powerOf: 0 } },
    ],
  },
});

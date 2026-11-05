import { defineCard } from "../define.js";

// EDHREC rank 22369.

export default defineCard({
  name: "Avenging Arrow",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature that dealt damage this turn.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { type: "creature", dealtDamageThisTurn: true },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});

import { defineCard } from "../define.js";

// EDHREC rank 25588.

export default defineCard({
  name: "Executioner's Swing",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Target creature that dealt damage this turn gets -5/-5 until end of turn.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { type: "creature", dealtDamageThisTurn: true },
    },
  ],
  effect: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
});

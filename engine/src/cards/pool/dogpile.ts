import { defineCard } from "../define.js";

export default defineCard({
  name: "Dogpile",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Dogpile deals damage to any target equal to the number of attacking creatures you control.",
  targets: ["any-target"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { countOf: { type: "creature", controlledBy: "you", attacking: true } },
  },
});

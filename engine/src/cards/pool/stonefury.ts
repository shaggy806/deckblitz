import { defineCard } from "../define.js";

export default defineCard({
  name: "Stonefury",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Stonefury deals damage to target creature equal to the number of lands you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
});

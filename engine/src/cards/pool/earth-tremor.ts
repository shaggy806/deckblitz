import { defineCard } from "../define.js";

// EDHREC rank 20053.

export default defineCard({
  name: "Earth Tremor",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Earth Tremor deals damage to target creature or planeswalker equal to the number of lands you control.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
});

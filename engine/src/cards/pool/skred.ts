import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 15574.

export default defineCard({
  name: "Skred",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Skred deals damage to target creature equal to the number of snow permanents you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { supertype: "snow", controlledBy: "you" } } },
});

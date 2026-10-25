import { defineCard } from "../define.js";

// EDHREC rank 23000.

export default defineCard({
  name: "Spire Barrage",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Spire Barrage deals damage to any target equal to the number of Mountains you control.",
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
});

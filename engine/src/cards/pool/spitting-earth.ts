import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 13421.

export default defineCard({
  name: "Spitting Earth",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Spitting Earth deals damage to target creature equal to the number of Mountains you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
});

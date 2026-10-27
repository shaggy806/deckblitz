import { defineCard } from "../define.js";

// EDHREC rank 28734.

export default defineCard({
  name: "Torrent of Fire",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Torrent of Fire deals damage to any target equal to the greatest mana value among permanents you control.",
  targets: ["any-target"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } },
  },
});

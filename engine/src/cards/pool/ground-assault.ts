import { defineCard } from "../define.js";

// EDHREC rank 14466. Rumbling Rockslide's shape.

export default defineCard({
  name: "Ground Assault",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Ground Assault deals damage to target creature equal to the number of lands you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
});

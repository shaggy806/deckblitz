import { defineCard } from "../define.js";

export default defineCard({
  name: "Rockslide Ambush",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rockslide Ambush deals damage to target creature equal to the number of Mountains you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
});

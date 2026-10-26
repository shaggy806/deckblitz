import { defineCard } from "../define.js";

export default defineCard({
  name: "Seismic Strike",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Seismic Strike deals damage to target creature equal to the number of Mountains you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
});

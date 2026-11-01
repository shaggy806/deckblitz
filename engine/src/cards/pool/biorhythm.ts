import { defineCard } from "../define.js";

export default defineCard({
  name: "Biorhythm",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player's life total becomes the number of creatures they control.",
  targets: [],
  effect: {
    kind: "set-life-total",
    who: "each-player",
    amount: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
  },
});

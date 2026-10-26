import { defineCard } from "../define.js";

// Wanderer's Strike's shape with destroy. An illegal target stops the whole
// spell (no proliferate); an indestructible or regenerating one still
// proliferates (the rulings).
export default defineCard({
  name: "Spread the Sickness",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature, then proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "proliferate" }],
  },
});

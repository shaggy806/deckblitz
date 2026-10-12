import { defineCard } from "../define.js";

export default defineCard({
  name: "Violet Pall",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["kindred", "instant"],
  subtypes: ["Faerie"],
  text: "Destroy target nonblack creature. Create a 1/1 black Faerie Rogue creature token with flying.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Faerie Rogue Token", count: 1 },
    ],
  },
});

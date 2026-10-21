import { defineCard } from "../define.js";

const FACES = ["Incubation // Incongruity", "Incubation", "Incongruity"];

// The right half of Incubation // Incongruity (rule 709). The exiled
// creature's controller as it left makes the token (Rapid Hybridization's
// shape); an illegal target means no token (the ruling).
export default defineCard({
  name: "Incongruity",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Exile target creature. That creature's controller creates a 3/3 green Frog Lizard creature token.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Frog Lizard Token", count: 1, who: "target-controller" },
    ],
  },
  faces: FACES,
  split: true,
});

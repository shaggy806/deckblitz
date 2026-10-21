import { defineCard } from "../define.js";

const FACES = ["Repudiate // Replicate", "Repudiate", "Replicate"];

// The right half of Repudiate // Replicate (rule 709): Sublime Epiphany's copy.
export default defineCard({
  name: "Replicate",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Create a token that's a copy of target creature you control.",
  targets: ["creature-you-control"],
  effect: { kind: "create-token-copy", of: 0, count: 1 },
  faces: FACES,
  split: true,
});

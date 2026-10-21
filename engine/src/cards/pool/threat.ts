import { defineCard } from "../define.js";

const FACES = ["Thrash // Threat", "Thrash", "Threat"];

export default defineCard({
  name: "Threat",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Create a 4/4 red and green Beast creature token with trample.",
  targets: [],
  effect: { kind: "create-token", token: "Beast Token (Red-Green)", count: 1 },
  faces: FACES,
  split: true,
});

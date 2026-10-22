import { defineCard } from "../define.js";

const FACES = ["Mouth // Feed", "Mouth", "Feed"];

export default defineCard({
  name: "Mouth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 3/3 green Hippo creature token.",
  targets: [],
  effect: { kind: "create-token", token: "Hippo Token", count: 1 },
  faces: FACES,
  split: true,
});

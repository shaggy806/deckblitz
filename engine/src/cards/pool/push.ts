import { defineCard } from "../define.js";

const FACES = ["Push // Pull", "Push", "Pull"];
const PUSH_TEXT = "Destroy target tapped creature.";

export default defineCard({
  name: "Push",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: PUSH_TEXT,
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});

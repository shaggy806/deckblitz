import { defineCard } from "../define.js";

const FACES = ["Push // Pull", "Push", "Pull"];
const PUSH_TEXT = "Destroy target tapped creature.";
const PULL_TEXT =
  "Put up to two target creature cards from a single graveyard onto the battlefield under your control. They gain haste until end of turn. Sacrifice them at the beginning of the next end step.";

export default defineCard({
  name: "Push // Pull",
  manaCost: "{1}{W/B}{4}{B/R}{B/R}",
  colors: ["W", "B", "R"],
  types: ["sorcery"],
  text: `${PUSH_TEXT}\n//\n${PULL_TEXT}`,
  faces: FACES,
  split: true,
});

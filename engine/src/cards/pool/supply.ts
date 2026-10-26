import { defineCard } from "../define.js";

// The left half of Supply // Demand.
const FACES = ["Supply // Demand", "Supply", "Demand"];

export default defineCard({
  name: "Supply",
  manaCost: "{X}{G}{W}",
  colors: ["G", "W"],
  types: ["sorcery"],
  text: "Create X 1/1 green Saproling creature tokens.",
  targets: [],
  effect: { kind: "create-token", token: "Saproling Token", count: "x" },
  faces: FACES,
  split: true,
});

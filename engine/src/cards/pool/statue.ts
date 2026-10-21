import { defineCard } from "../define.js";

const FACES = ["Status // Statue", "Status", "Statue"];
const STATUE_TEXT = "Destroy target artifact, creature, or enchantment.";

// The right half of Status // Statue (see status-statue.ts).
export default defineCard({
  name: "Statue",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: STATUE_TEXT,
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } }],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});

import { defineCard } from "../define.js";

const FACES = ["Hide // Seek", "Hide", "Seek"];

// The left half of Hide // Seek (see hide-seek.ts).
export default defineCard({
  name: "Hide",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Put target artifact or enchantment on the bottom of its owner's library.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
  effect: { kind: "put-on-bottom-of-library", target: 0 },
  faces: FACES,
  split: true,
});

import { defineCard } from "../define.js";

const FACES = ["Dusk // Dawn", "Dusk", "Dawn"];

export default defineCard({
  name: "Dusk",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all creatures with power 3 or greater.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", power: { op: "gte", n: 3 } } },
  faces: FACES,
  split: true,
});

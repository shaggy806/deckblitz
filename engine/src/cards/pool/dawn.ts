import { defineCard } from "../define.js";

const FACES = ["Dusk // Dawn", "Dusk", "Dawn"];

export default defineCard({
  name: "Dawn",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nReturn all creature cards with power 2 or less from your graveyard to your hand.",
  targets: [],
  effect: {
    kind: "return-from-graveyard",
    filter: { type: "creature", power: { op: "lte", n: 2 } },
    destination: "hand",
    count: "all",
  },
  faces: FACES,
  split: true,
  aftermath: true,
});

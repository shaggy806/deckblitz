import { defineCard } from "../define.js";

// Its ruling: ward can still be paid, but the spell isn't countered if it isn't.

export default defineCard({
  name: "Slice from the Shadows",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  cantBeCountered: true,
  text: "This spell can't be countered. (This includes by the ward ability.)\nTarget creature gets -X/-X until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { product: ["x", -1] },
    toughness: { product: ["x", -1] },
    duration: "end-of-turn",
  },
});

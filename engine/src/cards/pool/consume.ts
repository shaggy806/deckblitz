import { defineCard } from "../define.js";

const FACES = ["Consecrate // Consume", "Consecrate", "Consume"];

// The right half of Consecrate // Consume (rule 709). The player chooses among
// their creatures tied for the greatest power (the ruling — Gix's Command's
// filter). The life is the sacrificed creature's power as it last existed on
// the battlefield (the ruling); a negative power gains nothing, since an
// amount is never below 0 (rule 107.1b).
export default defineCard({
  name: "Consume",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Target player sacrifices a creature with the greatest power among creatures they control. You gain life equal to its power.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sacrifice",
        who: "target",
        filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
        count: 1,
      },
      { kind: "gain-life", amount: { thisWay: "sacrificed", sumOf: "power" } },
    ],
  },
  faces: FACES,
  split: true,
});

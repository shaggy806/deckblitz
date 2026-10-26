import { defineCard } from "../define.js";

const MINUS_X = { product: ["x", -1] } as const;

export default defineCard({
  name: "Death Wind",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -X/-X until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
});

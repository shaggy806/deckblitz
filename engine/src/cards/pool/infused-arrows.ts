import { defineCard } from "../define.js";

// EDHREC rank 25685.

export default defineCard({
  name: "Infused Arrows",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)\n{T}, Remove X charge counters from this artifact: Target creature gets -X/-X until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: "x" } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: { product: ["x", -1] }, toughness: { product: ["x", -1] }, duration: "end-of-turn" },
      resolve: null,
      text: "{T}, Remove X charge counters from this artifact: Target creature gets -X/-X until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
    },
  ],
});

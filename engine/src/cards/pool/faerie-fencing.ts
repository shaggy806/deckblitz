import { defineCard } from "../define.js";

export default defineCard({
  name: "Faerie Fencing",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -X/-X until end of turn. That creature gets an additional -3/-3 until end of turn if you controlled a Faerie as you cast this spell.",
  asCast: [{ condition: { kind: "controls", filter: { subtype: "Faerie" }, atLeast: 1 } }],
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "as-cast", fact: 0 },
        then: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      },
    ],
  },
});

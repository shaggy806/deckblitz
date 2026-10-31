import { defineCard } from "../define.js";

// Kaladesh. "-1/-1 for each {E} paid this way": -X/-X, X the `may`'s
// `costEnergyX: "any"` payment (0 to all the caster has).
export default defineCard({
  name: "Die Young",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose target creature. You get {E}{E} (two energy counters), then you may pay any amount of {E}. The creature gets -1/-1 until end of turn for each {E} paid this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 2 },
      {
        kind: "may",
        prompt: "Pay any amount of {E} to give the creature -1/-1 until end of turn for each?",
        costEnergyX: "any",
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { product: ["x", -1] },
          toughness: { product: ["x", -1] },
          duration: "end-of-turn",
        },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// Harnessed Lightning's shape, over a creature or planeswalker: any amount of
// energy, zero included (the rulings).

export default defineCard({
  name: "Galvanic Discharge",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose target creature or planeswalker. You get {E}{E}{E} (three energy counters), then you may pay any amount of {E}. Galvanic Discharge deals that much damage to that permanent.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 3 },
      {
        kind: "may",
        prompt: "Pay any amount of {E} to have Galvanic Discharge deal that much damage to that permanent?",
        costEnergyX: "any",
        effect: { kind: "damage", amount: "x", target: 0 },
      },
    ],
  },
});

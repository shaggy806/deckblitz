import { defineCard } from "../define.js";

// Kaladesh. The energy paid is the `may`'s `costEnergyX: "any"`: any amount
// from 0 to all the caster has, energy from before included (the ruling),
// and the damage is that amount — 0 damage is no damage (rule 120.8). An
// illegal target stops the whole spell: no energy, no payment (the rulings).
export default defineCard({
  name: "Harnessed Lightning",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose target creature. You get {E}{E}{E} (three energy counters), then you may pay any amount of {E}. Harnessed Lightning deals that much damage to that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 3 },
      {
        kind: "may",
        prompt: "Pay any amount of {E} to have Harnessed Lightning deal that much damage to that creature?",
        costEnergyX: "any",
        effect: { kind: "damage", amount: "x", target: 0 },
      },
    ],
  },
});

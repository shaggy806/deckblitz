import { defineCard } from "../define.js";

// Ruling: a source counts if it's colorless as the damage would be dealt,
// even one that didn't exist or wasn't colorless as this resolved (615.1).

export default defineCard({
  name: "Lithomancer's Focus",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. Prevent all damage that would be dealt to that creature this turn by colorless sources.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "damage-rule", to: { target: 0 }, by: { filter: { colorless: true } } },
    ],
  },
});

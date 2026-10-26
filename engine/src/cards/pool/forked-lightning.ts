import { defineCard } from "../define.js";

// Portal. EDHREC rank 27228.
//
// Aerial Volley's shape: the division is chosen as it's cast, at least 1 to
// each target (the ruling).
export default defineCard({
  name: "Forked Lightning",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Forked Lightning deals 4 damage divided as you choose among one, two, or three target creatures.",
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature" } }, min: 1, max: 3 }],
  divided: { total: 4, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});

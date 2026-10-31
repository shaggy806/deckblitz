import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 26354.
//
// X is counted as the spell is cast, when the division is announced (rule
// 601.2d) — so Volcanic Wind itself, a sorcery, never counts, and creatures
// that enter or leave in response change nothing. Each target gets at least
// 1, so no more targets than X (the engine caps the group at the total); a
// target gone illegal loses its share (608.2b).
export default defineCard({
  name: "Volcanic Wind",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Volcanic Wind deals X damage divided as you choose among any number of target creatures, where X is the number of creatures on the battlefield as you cast this spell.",
  targets: [{ kind: "any-number", of: "creature" }],
  divided: { total: { countOf: { type: "creature" } }, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});

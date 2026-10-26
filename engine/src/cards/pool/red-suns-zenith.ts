import { defineCard } from "../define.js";

// Annihilating Fire's shape at X, shuffled away like Green Sun's Zenith: only
// on resolving (a countered one goes to the graveyard — the ruling).
export default defineCard({
  name: "Red Sun's Zenith",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Red Sun's Zenith deals X damage to any target. If a creature dealt damage this way would die this turn, exile it instead. Shuffle Red Sun's Zenith into its owner's library.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
  shuffleIntoLibraryOnResolve: true,
});

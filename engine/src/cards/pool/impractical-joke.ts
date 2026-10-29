import { defineCard } from "../define.js";

// Rulings: the target is optional; a chosen target gone illegal means the
// spell doesn't resolve at all, so damage can still be prevented this turn.

export default defineCard({
  name: "Impractical Joke",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Damage can't be prevented this turn. Impractical Joke deals 3 damage to up to one target creature or planeswalker.",
  targets: [{ kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-cant-be-prevented" },
      { kind: "damage", amount: 3, target: 0 },
    ],
  },
});

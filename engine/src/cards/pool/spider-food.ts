import { defineCard } from "../define.js";

// EDHREC rank 7726.
//
// Rulings:
//   [2023-09-01] You can cast Spider Food without a target just to create a Food token. However,
//     if you do choose a target, and that target is illegal at the time Spider Food tries to
//     resolve, the spell won't resolve and none of its effects will happen. You won't create a
//     Food token.
//
// Mutant Chain Reaction's shape: an "up to one" target, and a spell whose only
// chosen target has gone illegal doesn't resolve (rule 608.2b).

export default defineCard({
  name: "Spider Food",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy up to one target artifact, enchantment, or creature with flying. Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: [
    {
      kind: "optional",
      of: {
        kind: "permanent",
        filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }] },
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Food Token", count: 1 },
    ],
  },
});

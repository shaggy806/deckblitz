import { defineCard } from "../define.js";

// EDHREC rank 15732.
//
// Rulings:
//   [2026-01-27] Some spells and abilities that create Mutagen tokens require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. The Mutagen token won't be created.
//   [2026-01-27] Mutagen tokens are a kind of predefined token. Each one is a colorless artifact
//     with the artifact subtype Mutagen and the ability "{1}, {T}, Sacrifice this token: Put a
//     +1/+1 counter on target creature. Activate only as a sorcery."


const TEXT =
  "Destroy up to one target artifact, enchantment, or creature with flying. Create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")";

// Storm, Shaker of Skies' "up to one" slot, then the Mutagen. With a target
// chosen and gone illegal the spell doesn't resolve, so no Mutagen (the
// ruling); with none chosen it simply makes the token.
export default defineCard({
  name: "Mutant Chain Reaction",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
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
      { kind: "create-token", token: "Mutagen Token", count: 1 },
    ],
  },
});

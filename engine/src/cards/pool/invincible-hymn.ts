import { defineCard } from "../define.js";

// Shards of Alara (ALA).
//
// "Your life total becomes that number" is gaining or losing the difference
// (rule 119.5 and the ruling), Form of the Dinosaur's shape with the library
// counted once, as it resolves.

const TEXT = "Count the number of cards in your library. Your life total becomes that number.";
const LIFE = { lifeTotal: "you" } as const;
const LIBRARY = { librarySize: "you" } as const;

export default defineCard({
  name: "Invincible Hymn",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "library-size", who: "you", compare: { op: "gt", n: { amount: LIFE } } },
    then: { kind: "gain-life", amount: { difference: [LIBRARY, LIFE] } },
    else: {
      kind: "conditional",
      condition: { kind: "library-size", who: "you", compare: { op: "lt", n: { amount: LIFE } } },
      then: { kind: "lose-life", amount: { difference: [LIFE, LIBRARY] } },
    },
  },
});

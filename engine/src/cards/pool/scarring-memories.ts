import { defineCard } from "../define.js";

// EDHREC rank 16436. A conditional flash (`flashIf`, rule 601.3d): an
// attacking legendary creature its caster controls as the cast begins.
export default defineCard({
  name: "Scarring Memories",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "You may cast this spell as though it had flash if you control an attacking legendary creature.\nTarget opponent sacrifices a creature of their choice, discards a card, and loses 3 life.",
  flashIf: {
    condition: {
      kind: "controls",
      filter: { type: "creature", supertype: "legendary", attacking: true },
      atLeast: 1,
    },
  },
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      { kind: "discard", target: 0, amount: 1 },
      { kind: "lose-life", amount: 3, target: 0 },
    ],
  },
});

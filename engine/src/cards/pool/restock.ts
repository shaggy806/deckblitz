import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 20344. Wildest Dreams' shape with exactly two targets.

export default defineCard({
  name: "Restock",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return two target cards from your graveyard to your hand. Exile Restock.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, min: 2, max: 2 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
  exileOnResolve: true,
});

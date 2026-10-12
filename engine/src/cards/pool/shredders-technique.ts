import { defineCard } from "../define.js";

export default defineCard({
  name: "Shredder's Technique",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  sneak: { cost: "{B}" },
  text:
    "Sneak {B} (You may cast this spell for {B} if you also return an unblocked attacker you control to hand during the declare blockers step.)\n" +
    "Destroy target creature or enchantment. If an enchantment was destroyed this way, you lose 2 life.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "enchantment"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "destroyed", filter: { type: "enchantment" } },
        then: { kind: "lose-life", amount: 2 },
      },
    ],
  },
});

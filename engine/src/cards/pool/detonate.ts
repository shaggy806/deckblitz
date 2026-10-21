import { defineCard } from "../define.js";

// Ruling: if the artifact is an illegal target as Detonate resolves, no
// damage is dealt — its only target gone, the spell does nothing (608.2b).
// "That artifact's controller" is read as it last existed (608.2h).

export default defineCard({
  name: "Detonate",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact with mana value X. It can't be regenerated. Detonate deals X damage to that artifact's controller.",
  targets: [{ kind: "permanent", filter: { type: "artifact", manaValue: { op: "eq", n: "x" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "damage", amount: "x", toControllerOfTarget: 0 },
    ],
  },
});

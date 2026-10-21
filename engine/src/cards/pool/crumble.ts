import { defineCard } from "../define.js";

// EDHREC rank 22920. Swords to Plowshares' shape: the life is gained by the
// artifact's controller as it last existed, its mana value read the same way.
// An illegal target counters the whole spell, so no life (its ruling); an
// indestructible artifact survives and its controller still gains the life.

export default defineCard({
  name: "Crumble",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact. It can't be regenerated. That artifact's controller gains life equal to its mana value.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "gain-life", amount: { manaValueOf: 0 }, toControllerOfTarget: 0 },
    ],
  },
});

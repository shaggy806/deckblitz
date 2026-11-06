import { defineCard } from "../define.js";

// EDHREC rank 25468.
//
// X is read as the exiled permanent last existed on the battlefield (rule
// 608.2h), the way Aether Mutation reads its bounced creature.

export default defineCard({
  name: "Deliver from Chaos",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text:
    "Exile target artifact or creature. Create X 1/1 colorless Borg artifact creature tokens, where X is that " +
    "permanent's mana value.",
  targets: ["artifact-or-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Borg Token", count: { manaValueOf: 0 } },
    ],
  },
});

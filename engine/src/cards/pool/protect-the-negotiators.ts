import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 12066.
//
// Rulings:
//   You may not cast Protect the Negotiators without a spell to target.
//   Once Protect the Negotiators starts to resolve, its instructions are followed in the order
//     they're written. If it was kicked, the Soldier creature token will be on the battlefield
//     when the amount of mana the target spell's controller needs to pay is determined.
//
// The amount to pay is counted as the counter instruction applies, so a
// kicked cast counts the new Soldier.
const COUNTER: EffectSpec = {
  kind: "unless",
  chooser: 0,
  options: [
    {
      payGeneric: { countOf: { type: "creature", controlledBy: "you" } },
      text: "Pay {1} for each creature its caster controls.",
    },
  ],
  otherwise: { kind: "counter", target: 0 },
};

export default defineCard({
  name: "Protect the Negotiators",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Kicker {W} (You may pay an additional {W} as you cast this spell.)\n" +
    "If this spell was kicked, create a 1/1 white Soldier creature token.\n" +
    "Counter target spell unless its controller pays {1} for each creature you control.",
  targets: ["spell"],
  effect: COUNTER,
  kicker: {
    cost: "{W}",
    effect: {
      kind: "sequence",
      effects: [{ kind: "create-token", token: "Soldier Token", count: 1 }, COUNTER],
    },
  },
});

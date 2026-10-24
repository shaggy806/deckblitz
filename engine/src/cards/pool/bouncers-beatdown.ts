import { defineCard } from "../define.js";

// EDHREC rank 21309.

const YOUR_CREATURES = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Bouncer's Beatdown",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets a black permanent.\nBouncer's Beatdown deals X damage to target creature or planeswalker, where X is the greatest power among creatures you control. If that creature or planeswalker would die this turn, exile it instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  targetCostReduction: { filter: { colors: ["B"] }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { aggregate: "max", of: "power", filter: YOUR_CREATURES }, target: 0 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});

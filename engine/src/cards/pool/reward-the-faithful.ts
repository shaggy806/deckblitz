import { defineCard } from "../define.js";

// EDHREC rank 23334.

export default defineCard({
  name: "Reward the Faithful",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Any number of target players each gain life equal to the greatest mana value among permanents you control.",
  targets: [{ kind: "any-number", of: "player" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "gain-life",
      amount: { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } },
      toControllerOfTarget: 0,
    },
    simultaneous: true,
  },
});

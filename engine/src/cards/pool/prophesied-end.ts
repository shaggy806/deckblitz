import { defineCard } from "../define.js";

// EDHREC rank 23781.
//
// Whether it's attacking is asked before it's destroyed: a creature that has left the battlefield
// is no longer in combat, and the question is about how it stood as the spell resolved.

export default defineCard({
  name: "Prophesied End",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature. If it wasn't attacking, its controller draws a card.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { attacking: true } },
    then: { kind: "destroy", target: 0 },
    else: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
      ],
    },
  },
});

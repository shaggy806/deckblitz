import { defineCard } from "../define.js";

// EDHREC rank 20487. One exile event, then a delayed triggered ability
// (rule 603.7) about what it exiled — Rally the Ancestors' shape — returning
// those cards together under their owners' control. It triggers once; a token
// exiled this way has ceased to exist and doesn't return.

export default defineCard({
  name: "Sudden Disappearance",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile all nonland permanents target player controls. Return the exiled cards to the battlefield under their owner's control at the beginning of the next end step.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { notTypes: ["land"], controlledBy: "you" }, controlledByTarget: 0 },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        about: "exiled",
        effect: {
          kind: "for-each-target",
          from: 0,
          effect: { kind: "put-onto-battlefield", target: 0 },
          simultaneous: true,
        },
        text: "Return the exiled cards to the battlefield under their owner's control.",
      },
    ],
  },
});

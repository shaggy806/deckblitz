import { defineCard } from "../define.js";

export default defineCard({
  name: "Hunters' Feast",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Any number of target players each gain 6 life.",
  targets: [{ kind: "any-number", of: "player" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "gain-life", amount: 6, toControllerOfTarget: 0 },
    simultaneous: true,
  },
});

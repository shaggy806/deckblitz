import { defineCard } from "../define.js";

const THEIRS = { countOf: { type: "creature", controlledBy: "you", subtype: "$chosen" }, forTarget: 0 } as const;

export default defineCard({
  name: "Pact of the Serpent",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a creature type. Target player draws X cards and loses X life, where X is the number of creatures they control of the chosen type.",
  targets: ["player"],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: THEIRS, target: 0 },
        { kind: "lose-life", amount: THEIRS, target: 0 },
      ],
    },
  },
});

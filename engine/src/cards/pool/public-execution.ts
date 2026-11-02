import { defineCard } from "../define.js";

export default defineCard({
  name: "Public Execution",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature an opponent controls. Each other creature that player controls gets -2/-0 until end of turn.",
  targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        exceptTarget: 0,
        as: 1,
        simultaneous: true,
        effect: { kind: "modify-pt", target: 1, power: -2, toughness: 0, duration: "end-of-turn" },
      },
    ],
  },
});

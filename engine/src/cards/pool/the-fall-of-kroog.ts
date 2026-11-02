import { defineCard } from "../define.js";

export default defineCard({
  name: "The Fall of Kroog",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose target opponent. Destroy target land that player controls. The Fall of Kroog deals 3 damage to that player and 1 damage to each creature they control.",
  targets: ["opponent", { kind: "other", of: "land", than: { slot: 0 }, sameController: true }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 1 },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, amount: 1, controlledByTarget: 0 },
        ],
      },
    ],
  },
});

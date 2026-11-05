import { defineCard } from "../define.js";

// EDHREC rank 8827. "The same controller" is the target creature's, read as
// it resolves; all of the damage is one event.

export default defineCard({
  name: "Fear, Fire, Foes!",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Damage can't be prevented this turn. Fear, Fire, Foes! deals X damage to target creature and 1 damage to each other creature with the same controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-cant-be-prevented" },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          {
            kind: "for-each-permanent",
            filter: { type: "creature", controlledBy: "you" },
            controlledByTarget: 0,
            exceptTarget: 0,
            as: 1,
            simultaneous: true,
            effect: { kind: "damage", amount: 1, target: 1 },
          },
        ],
      },
    ],
  },
});

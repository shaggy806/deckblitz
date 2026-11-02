import { defineCard } from "../define.js";

// "Can't block" binds what enters later too; the damage only what's there as
// it resolves (rule 611.2c, the ruling).
export default defineCard({
  name: "Ember Gale",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Creatures target player controls can't block this turn. Ember Gale deals 1 damage to each white and/or blue creature that player controls.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        restrictions: ["cant-block"],
      },
      {
        kind: "damage-all",
        filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] },
        amount: 1,
        controlledByTarget: 0,
      },
    ],
  },
});

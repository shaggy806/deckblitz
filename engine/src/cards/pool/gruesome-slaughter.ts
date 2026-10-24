import { defineCard } from "../define.js";

// EDHREC rank 9679.
//
// The colorless creatures you control are fixed as it resolves (rule 611.2c).
// The granted ability's "this creature" is the creature, which deals the
// damage — Dead Before Sunrise's shape.
const GRANTED_TEXT = "{T}: This creature deals damage equal to its power to target creature.";

export default defineCard({
  name: "Gruesome Slaughter",
  manaCost: "{6}",
  colors: [],
  types: ["sorcery"],
  text: `Until end of turn, colorless creatures you control gain "${GRANTED_TEXT}"`,
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { type: "creature", colorless: true, controlledBy: "you" },
    ability: {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: GRANTED_TEXT,
    },
    duration: "end-of-turn",
  },
});

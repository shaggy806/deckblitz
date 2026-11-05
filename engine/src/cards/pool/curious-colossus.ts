import { defineCard } from "../define.js";

// EDHREC rank 8353. Indefinitely, and only the creatures that player controls
// as it resolves (the rulings); a later P/T-setting effect overwrites it.
const ETB_TEXT =
  "When this creature enters, each creature target opponent controls loses all abilities, becomes a Coward in addition to its other types, and has base power and toughness 1/1.";

export default defineCard({
  name: "Curious Colossus",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 7,
  toughness: 7,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        as: 1,
        simultaneous: true,
        effect: {
          kind: "animate",
          target: 1,
          power: 1,
          toughness: 1,
          addTypes: [],
          addSubtypes: ["Coward"],
          loseAbilities: true,
          duration: "permanent",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
